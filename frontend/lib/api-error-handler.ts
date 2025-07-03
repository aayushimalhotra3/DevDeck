import { useToast } from '@/components/ui/use-toast';

// API Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp?: string;
}

// Error response structure from backend
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  code?: string;
  statusCode?: number;
}

// Custom error class for API errors
export class ApiErrorClass extends Error {
  public status: number;
  public code?: string;
  public details?: any;
  public timestamp: string;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Error message mappings for better user experience
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You need to sign in to access this feature.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Request timeout. Please try again.',
};

// Specific error codes for better handling
const SPECIFIC_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User account not found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_TAKEN: 'This username is already taken.',
  PORTFOLIO_NOT_FOUND: 'Portfolio not found.',
  GITHUB_API_ERROR: 'Unable to connect to GitHub. Please try again.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait before trying again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NETWORK_ERROR:
    'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

// Parse error response from API
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let errorData: ErrorResponse;

  try {
    errorData = await response.json();
  } catch {
    // If response is not JSON, create a generic error
    return {
      message:
        ERROR_MESSAGES[response.status] || 'An unexpected error occurred.',
      status: response.status,
      timestamp: new Date().toISOString(),
    };
  }

  // Extract error message
  let message =
    errorData.message ||
    ERROR_MESSAGES[response.status] ||
    'An unexpected error occurred.';

  // Use specific error message if available
  if (errorData.code && SPECIFIC_ERROR_MESSAGES[errorData.code]) {
    message = SPECIFIC_ERROR_MESSAGES[errorData.code];
  }

  // Handle validation errors
  if (errorData.errors && errorData.errors.length > 0) {
    const validationMessages = errorData.errors.map(
      err => `${err.field}: ${err.message}`
    );
    message = validationMessages.join(', ');
  }

  return {
    message,
    status: response.status,
    code: errorData.code,
    details: errorData.errors || errorData.error,
    timestamp: new Date().toISOString(),
  };
};

// Enhanced fetch wrapper with error handling
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const apiError = await parseApiError(response);
      throw new ApiErrorClass(
        apiError.message,
        apiError.status,
        apiError.code,
        apiError.details
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiErrorClass(
        SPECIFIC_ERROR_MESSAGES.NETWORK_ERROR,
        0,
        'NETWORK_ERROR'
      );
    }

    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiErrorClass(
        SPECIFIC_ERROR_MESSAGES.TIMEOUT_ERROR,
        0,
        'TIMEOUT_ERROR'
      );
    }

    // Re-throw API errors
    if (error instanceof ApiErrorClass) {
      throw error;
    }

    // Handle unknown errors
    throw new ApiErrorClass(
      'An unexpected error occurred. Please try again.',
      500,
      'UNKNOWN_ERROR',
      error
    );
  }
};

// Hook for handling API errors with toast notifications
export const useApiErrorHandler = () => {
  const { toast } = useToast();

  const handleApiError = (
    error: ApiError | ApiErrorClass | Error,
    context?: string
  ) => {
    let title = 'Error';
    let description = 'An unexpected error occurred.';
    let variant: 'default' | 'destructive' = 'destructive';

    if (error instanceof ApiErrorClass) {
      title = getErrorTitle(error.status);
      description = error.message;

      // Different styling for different error types
      if (error.status === 401) {
        variant = 'default';
        title = 'Authentication Required';
      } else if (error.status === 403) {
        title = 'Access Denied';
      } else if (error.status >= 500) {
        title = 'Server Error';
      }
    } else if ('status' in error && 'message' in error) {
      title = getErrorTitle(error.status);
      description = error.message;
    } else {
      description = error.message || description;
    }

    // Add context if provided
    if (context) {
      title = `${title} - ${context}`;
    }

    toast({
      title,
      description,
      variant,
      duration:
        error instanceof ApiErrorClass && error.status === 401 ? 5000 : 4000,
    });

    // Log error for debugging
    console.error('API Error:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  };

  return { handleApiError };
};

// Get appropriate error title based on status code
const getErrorTitle = (status: number): string => {
  if (status >= 400 && status < 500) {
    return 'Request Error';
  } else if (status >= 500) {
    return 'Server Error';
  } else {
    return 'Error';
  }
};

// Retry mechanism for failed requests
export const retryApiRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (4xx)
      if (
        error instanceof ApiErrorClass &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }

  throw lastError!;
};

// Utility function to check if error is retryable
export const isRetryableError = (error: ApiError | ApiErrorClass): boolean => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR'];

  const hasRetryableStatus = retryableStatuses.includes(error.status);
  const hasRetryableCode =
    error.code &&
    typeof error.code === 'string' &&
    retryableCodes.includes(error.code);

  return hasRetryableStatus || Boolean(hasRetryableCode);
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);

    // Prevent the default browser error handling
    event.preventDefault();

    // You could show a global error notification here
    // or send the error to an error tracking service
  });
}

const apiErrorHandler = {
  parseApiError,
  apiRequest,
  useApiErrorHandler,
  retryApiRequest,
  isRetryableError,
  ApiErrorClass,
};

export default apiErrorHandler;
