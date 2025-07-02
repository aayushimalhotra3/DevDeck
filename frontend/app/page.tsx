import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">DevDeck</span>
        </h1>

        <p className="mt-3 text-2xl">
          Build and share your developer portfolio with real-time editing
        </p>

        <div className="flex mt-6 space-x-4">
          <Link href="/auth/signin">
            <Button size="lg">Get Started with GitHub</Button>
          </Link>
          <Link href="/preview/demo">
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-around max-w-4xl mt-6 sm:w-full">
          <div className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">GitHub Integration &rarr;</h3>
            <p className="mt-4 text-xl">
              Automatically sync your repositories and showcase your best work
            </p>
          </div>

          <div className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Drag & Drop Editor &rarr;</h3>
            <p className="mt-4 text-xl">
              Build your portfolio with an intuitive block-based editor
            </p>
          </div>

          <div className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Real-time Preview &rarr;</h3>
            <p className="mt-4 text-xl">
              See changes instantly with live WebSocket updates
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
