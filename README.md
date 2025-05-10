# GCarotto Fansite

A collaborative multilingual fansite for PetStar Game built with Jekyll.

## Technology Stack

- Jekyll static site generator
- jekyll-polyglot for internationalization
- SCSS for styling
- Vanilla JavaScript for interactivity
- GitHub Pages for hosting

## Getting Started

### Prerequisites

- Ruby 2.7+ and RubyGems
- Bundler (`gem install bundler`)
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/username/gcarotto-fansite.git
   cd gcarotto-fansite
   ```

2. Install dependencies:
   ```
   bundle install
   ```

### Development

To start the development server:

```
bundle exec jekyll serve
```

This will:
- Build the site
- Start a local server at http://localhost:4000
- Watch for changes and rebuild automatically

### Building for Production

To build the site for production:

```
bundle exec jekyll build
```

The output will be in the `_site` directory, ready to be deployed to any static hosting service.

## Directory Structure

- `/layouts/` - HTML templates
- `/includes/` - Reusable components
- `/data/` - Language translations and site data
- `/assets/` - Static assets (CSS, JS, images)
- `_config.yml` - Jekyll configuration

## License

- Content: Creative Commons BY-NC-SA
- Code: MIT/GPLv3

See the [LICENSE](LICENSE) file for details.
