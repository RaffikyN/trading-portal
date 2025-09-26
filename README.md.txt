# Trading Portal

A comprehensive web application for futures traders to manage journal entries, track accounts, record withdrawals, set financial goals, and analyze trading performance.

## Features

- **Dashboard** - Overview of portfolio performance, stats, and recent activity
- **Trading Journal** - CSV import and trade management with filtering
- **Account Tracker** - Automatic account detection and balance tracking
- **Withdrawal Tracker** - Record and manage withdrawals
- **Financial Planner** - Set and track monthly profit goals
- **Analysis** - Comprehensive performance analysis with charts

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd trading-portal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## CSV Import Format

The application expects CSV files with the following columns:

- `name` - Account name/identifier
- `order_id` - Unique trade identifier
- `symbol` - Trading instrument (e.g., NQ, ES)
- `mov_time` - Trade execution timestamp
- `mov_type` - Position size (positive for long, negative for short)
- `exec_qty` - Quantity traded
- `price_done` - Execution price
- `points` - Points gained/lost
- `profit` - Profit/loss in dollars

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push to main branch

### Manual Build

```bash
npm run build
npm start
```

## Usage

### Importing Trades

1. Navigate to **Trading Journal**
2. Click **Choose File** or drag & drop your CSV export
3. Trades will be automatically parsed and accounts created
4. Data flows to Dashboard, Account Tracker, and Analysis

### Setting Goals

1. Go to **Financial Planner**
2. Click **Set New Goal**
3. Choose month and target amount
4. Track progress against actual performance

### Recording Withdrawals

1. Visit **Withdrawal Tracker**
2. Click **Record Withdrawal**
3. Select account, amount, and date
4. Balances automatically update

## Project Structure

```
src/
├── components/
│   └── Layout.js          # Main layout with sidebar
├── context/
│   └── TradingContext.js  # Global state management
├── pages/
│   ├── index.js           # Dashboard
│   ├── journal.js         # Trading Journal
│   ├── accounts.js        # Account Tracker
│   ├── withdrawals.js     # Withdrawal Tracker
│   ├── planner.js         # Financial Planner
│   ├── analysis.js        # Performance Analysis
│   └── _app.js            # App wrapper
└── styles/
    └── globals.css        # Global styles
```

## Features in Detail

### Dashboard
- Real-time portfolio P&L
- Win rate and statistics
- Performance chart over time
- Trading calendar with daily P&L
- Weekly/monthly summaries
- Quick actions and recent activity

### Trading Journal
- Drag & drop CSV import
- Automatic trade parsing
- Date range and symbol filtering
- Account-based filtering
- Comprehensive trade table
- Data validation and error handling

### Account Tracker
- Automatic account detection from trades
- Starting/current balance tracking
- Performance visualization
- Account status management
- Portfolio-level statistics

### Withdrawal Tracker
- Manual withdrawal recording
- Balance adjustments
- Monthly/total summaries
- Historical tracking
- Account-specific withdrawals

### Financial Planner
- Monthly goal setting
- Progress tracking
- Achievement rates
- Goal vs actual comparison
- SMART goal guidelines

### Analysis
- Performance by instrument
- Time-based analysis (hourly/daily)
- Win/loss distribution
- Profit factor calculations
- Expectancy analysis
- Interactive charts and visualizations

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  'trading-bg': '#000000',      // Background
  'trading-card': '#1a1a1a',    // Card background
  'trading-pink': '#ec4899',    // Primary accent
  'trading-green': '#10b981',   // Profit color
  'trading-red': '#ef4444',     // Loss color
}
```

### Starting Balance

Default account starting balance is set to $100,000. Modify in `TradingContext.js`:

```javascript
startingBalance: 100000, // Change this value
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or feature requests, please open an issue on GitHub.