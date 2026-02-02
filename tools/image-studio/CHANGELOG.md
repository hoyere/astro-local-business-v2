# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-09-12

### Added
- Initial release of Unsplash Image Fetcher
- TypeScript CLI tool for batch image downloading
- Intelligent image selection based on luminance and color analysis  
- Auto .env detection for multi-project setups
- Support for 8 business types: landscaping, attorney, carpenter, handyman, automobile, roofer, welding, common
- Local manifest management with complete metadata tracking
- Built-in rate limiting and retry logic
- Cross-platform support (Windows, Mac, Linux)
- Comprehensive documentation and setup guides

### Features
- **CLI Interface**: Easy command-line usage with verbose mode
- **Environment Detection**: Automatically finds .env files in parent directories
- **Business Queries**: Pre-configured search terms for different industries  
- **Manifest System**: JSON-based tracking of downloaded images
- **Quality Selection**: Smart algorithm for choosing best images
- **Rate Limiting**: Built-in 500ms delays to respect API limits
- **Error Handling**: Robust error handling and user feedback
- **TypeScript**: Full TypeScript support with type definitions

### Configuration
- Configurable image queries via `unsplash.config.json`
- Support for custom business types
- Adjustable quality, orientation, and rate limiting settings
- Environment variable management

### Documentation  
- Comprehensive README with examples
- New computer setup guide
- Integration guides for Astro projects
- Troubleshooting documentation
- API usage best practices