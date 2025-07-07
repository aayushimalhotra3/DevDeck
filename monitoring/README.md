# DevDeck Monitoring System

This directory contains comprehensive monitoring tools for DevDeck.

## Scripts

### Health Monitoring
- `health-check.sh` - Checks application health and sends alerts
- `performance-monitor.sh` - Monitors response times and system metrics
- `dashboard.sh` - Real-time monitoring dashboard

### Log Management
- `aggregate-logs.sh` - Collects and analyzes logs from various sources

### Automation
- `setup-cron.sh` - Sets up automated monitoring tasks

## Configuration

1. Copy `config.env` and customize the variables:
   ```bash
   cp config.env .env
   # Edit .env with your settings
   ```

2. Set up cron jobs for automated monitoring:
   ```bash
   ./setup-cron.sh
   ```

## Usage

### Manual Health Check
```bash
./health-check.sh
```

### Performance Monitoring
```bash
./performance-monitor.sh
```

### Real-time Dashboard
```bash
./dashboard.sh
```

### Log Analysis
```bash
./aggregate-logs.sh
```

## Alerts

Configure Slack webhooks in `config.env` to receive alerts for:
- Application downtime
- Database connection issues
- Performance degradation
- Error spikes

## Files Generated

- `health-check.log` - Health check history
- `performance.log` - Performance metrics history
- `metrics.json` - Latest performance metrics
- `aggregated.log` - Aggregated application logs
- `errors.log` - Extracted error logs
- `summary.log` - Log analysis summary
- `cron.log` - Automated task logs

## Troubleshooting

1. **Health checks failing**: Check application URLs in config
2. **No metrics**: Ensure applications are running and accessible
3. **Cron jobs not running**: Check cron service and permissions
4. **Alerts not sending**: Verify webhook URLs and network connectivity
