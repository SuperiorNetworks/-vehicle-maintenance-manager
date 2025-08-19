# Vehicle Maintenance Manager

**Version:** 1.0.0  
**Copyright:** 2025 Superior Networks LLC  
**Developer:** Dwain Henderson Jr.  
**Company:** Superior Networks LLC, 703 Jefferson St. Dayton Ohio, 45342 (937) 985-2480

## Overview

The Vehicle Maintenance Manager is a comprehensive web application designed to help individuals and businesses track vehicle maintenance, manage receipts, and stay on top of important automotive schedules. Built with modern web technologies and integrated with Google Sheets for cloud storage, this application provides a complete solution for vehicle maintenance management.

## Key Features

### 🚗 Vehicle Management
- Add and manage multiple vehicles
- Track vehicle details (VIN, license plate, mileage, etc.)
- Monitor warranty, insurance, and registration expiration dates
- Upload and store vehicle photos

### 🔧 Maintenance Logging
- Log detailed maintenance activities
- Quick actions for common services (oil changes, tire rotations, inspections)
- Track service costs and providers
- Set maintenance reminders based on mileage or dates
- Photo documentation for maintenance work

### 📄 Receipt Management
- Upload and organize maintenance receipts
- Categorize receipts by service type
- Search and filter receipt database
- Export capabilities for tax and accounting purposes
- Grid and list view modes

### 📊 Dashboard & Analytics
- Overview of all vehicles and maintenance status
- Cost tracking and spending analysis
- Maintenance alerts and reminders
- Recent activity timeline

### 📱 Mobile-Friendly Design
- Responsive design works on all devices
- Touch-optimized interface
- Mobile photo capture for receipts and documentation
- Offline capability with local storage

### ☁️ Cloud Integration
- Google Sheets backend for data storage
- Google Drive integration for image storage
- Real-time synchronization across devices
- Secure data backup and recovery

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **File Storage:** Google Drive
- **Styling:** Custom CSS with mobile-first responsive design
- **Color Scheme:** Based on snightton.com design

## File Structure

```
vehicle_maintenance_app/
├── index.html                 # Dashboard page
├── vehicle_manager.html       # Vehicle management page
├── maintenance_log.html       # Maintenance logging page
├── receipt_manager.html       # Receipt management page
├── css/
│   └── styles.css            # Main stylesheet
├── js/
│   ├── app.js                # Core application logic
│   ├── vehicle_manager.js    # Vehicle management functionality
│   ├── maintenance_log.js    # Maintenance logging functionality
│   ├── receipt_manager.js    # Receipt management functionality
│   └── google_sheets.js      # Google Sheets integration
├── gas/
│   ├── code.gs               # Google Apps Script backend
│   └── setup_guide.md        # Google Apps Script setup instructions
├── README.md                 # This file
├── testing_results.md        # Comprehensive testing report
└── deployment_guide.md       # Deployment instructions
```

## Quick Start

### 1. Download and Extract
Download the complete application package and extract to your desired location.

### 2. Set Up Google Apps Script Backend
1. Follow the detailed instructions in `gas/setup_guide.md`
2. Deploy the Google Apps Script as a web app
3. Copy the web app URL for frontend configuration

### 3. Configure the Frontend
1. Open the application in a web browser
2. Navigate to Settings (or use the Sync Data button)
3. Enter your Google Apps Script web app URL
4. Test the connection

### 4. Start Using
1. Add your first vehicle
2. Log maintenance activities
3. Upload receipts
4. Monitor your dashboard for alerts and reminders

## Detailed Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google account for backend integration
- Basic understanding of web applications

### Google Apps Script Setup
Detailed instructions are provided in `gas/setup_guide.md`. The setup process includes:
1. Creating a new Google Apps Script project
2. Copying the backend code
3. Enabling required APIs
4. Deploying as a web app
5. Configuring permissions

### Local Development
For development or customization:
1. Serve files through a local web server (not file:// protocol)
2. Use browser developer tools for debugging
3. Check console logs for any errors
4. Test on multiple devices and browsers

## Usage Guide

### Adding Vehicles
1. Click "Add Vehicle" from the dashboard or vehicle manager
2. Fill in vehicle details (Make, Model, Year are required)
3. Add optional information like VIN, license plate, dates
4. Upload a vehicle photo if desired
5. Save the vehicle

### Logging Maintenance
1. Use quick action buttons for common services
2. Or click "Log Maintenance" for custom entries
3. Select the vehicle and maintenance type
4. Enter service details, cost, and provider
5. Upload photos of work performed
6. Set next service reminders

### Managing Receipts
1. Click "Add Receipt" to upload a new receipt
2. Take a photo or upload an existing image
3. Enter receipt details and categorize
4. Link to maintenance records if applicable
5. Use filters to find specific receipts

### Dashboard Monitoring
- Check vehicle status and upcoming maintenance
- Review spending patterns and costs
- Respond to maintenance alerts
- Sync data with Google Sheets

## Customization

### Color Scheme
The application uses a professional color scheme based on snightton.com:
- Primary Blue: #2563eb
- Secondary colors for different sections
- Responsive design adapts to all screen sizes

### Adding Features
The modular JavaScript architecture makes it easy to add new features:
1. Create new JavaScript modules following existing patterns
2. Add new HTML pages using the established template
3. Extend the Google Apps Script backend as needed
4. Update the CSS for consistent styling

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Support
- iOS Safari 13+
- Android Chrome 80+
- Responsive design works on all screen sizes

## Security & Privacy

### Data Security
- All data stored in your personal Google account
- Google Apps Script provides secure API access
- No third-party data sharing
- Local storage used for offline functionality

### Privacy Considerations
- Vehicle and maintenance data remains private
- Images stored in your Google Drive
- No tracking or analytics included
- Full control over data sharing and access

## Troubleshooting

### Common Issues

#### Application Not Loading
- Check browser console for JavaScript errors
- Ensure all files are present and accessible
- Verify Google Apps Script is properly deployed

#### Data Not Syncing
- Check Google Apps Script web app URL configuration
- Verify internet connection
- Check Google Apps Script execution logs
- Ensure proper permissions are granted

#### Mobile Issues
- Clear browser cache
- Check viewport meta tag
- Test touch interactions
- Verify responsive CSS is loading

### Getting Help
1. Check the testing_results.md for known issues
2. Review browser console for error messages
3. Verify Google Apps Script setup following gas/setup_guide.md
4. Contact support: Superior Networks LLC (937) 985-2480

## Performance Optimization

### Best Practices
- Regular data cleanup and archiving
- Optimize image sizes before upload
- Use browser caching effectively
- Monitor Google Apps Script execution quotas

### Scaling Considerations
- Google Sheets has row limits (2 million cells)
- Google Drive storage limits apply
- Consider data archiving for long-term use
- Monitor API usage quotas

## Maintenance & Updates

### Regular Maintenance
- Review and clean up old data
- Monitor Google Drive storage usage
- Check for browser compatibility updates
- Backup important data regularly

### Version Updates
- Follow semantic versioning (Major.Minor.Patch)
- Test thoroughly before deploying updates
- Maintain backward compatibility when possible
- Document all changes in version logs

## License & Support

### License
This application is proprietary software developed by Superior Networks LLC. All rights reserved.

### Support
- **Developer:** Dwain Henderson Jr.
- **Company:** Superior Networks LLC
- **Address:** 703 Jefferson St. Dayton Ohio, 45342
- **Phone:** (937) 985-2480
- **Support Hours:** Business hours, Monday-Friday

### Warranty
This software is provided "as is" without warranty of any kind. Superior Networks LLC provides best-effort support for setup and basic troubleshooting.

## Changelog

### Version 1.0.0 (August 19, 2025)
- Initial release
- Complete vehicle maintenance management system
- Google Sheets and Google Drive integration
- Mobile-responsive design
- Comprehensive testing completed
- Full documentation package

---

**© 2025 Superior Networks LLC. All rights reserved.**  
**Developed by Dwain Henderson Jr.**

