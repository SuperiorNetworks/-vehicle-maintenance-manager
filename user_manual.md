# Vehicle Maintenance Manager - User Manual

**Version:** 1.0.0  
**Copyright:** 2025 Superior Networks LLC  
**Developer:** Dwain Henderson Jr.

## Welcome to Vehicle Maintenance Manager

Thank you for choosing Vehicle Maintenance Manager, your comprehensive solution for tracking vehicle maintenance, managing receipts, and staying on top of important automotive schedules. This user manual will guide you through all the features and help you get the most out of your application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Vehicles](#managing-vehicles)
4. [Logging Maintenance](#logging-maintenance)
5. [Managing Receipts](#managing-receipts)
6. [Mobile Usage](#mobile-usage)
7. [Data Management](#data-management)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Support](#support)

## Getting Started

### First Time Setup

When you first open Vehicle Maintenance Manager, you'll see the dashboard with empty statistics. Here's how to get started:

1. **Add Your First Vehicle**
   - Click the "Add Vehicle" button on the dashboard
   - Fill in your vehicle information (Make, Model, and Year are required)
   - Add optional details like VIN, license plate, and important dates
   - Upload a photo of your vehicle if desired
   - Click "Save Vehicle"

2. **Configure Cloud Sync (Optional)**
   - Click the "Sync Data" button on the dashboard
   - If prompted, enter your Google Apps Script web app URL
   - This enables cloud backup and multi-device access

3. **Explore the Interface**
   - Use the navigation tabs to explore different sections
   - Dashboard: Overview and quick actions
   - Vehicles: Manage your vehicle information
   - Maintenance: Log and track maintenance activities
   - Receipts: Store and organize maintenance receipts

## Dashboard Overview

The dashboard is your command center, providing a quick overview of your vehicle maintenance status.

### Key Sections

#### Statistics Cards
- **Total Vehicles:** Number of vehicles in your system
- **Overdue Items:** Maintenance tasks that are past due
- **Upcoming:** Maintenance scheduled for the near future
- **This Month:** Total spending on maintenance this month

#### Maintenance Alerts
- Shows important reminders and overdue items
- Color-coded for urgency (red for overdue, yellow for upcoming)
- Click on alerts to take action

#### Your Vehicles Section
- Quick overview of all your vehicles
- Shows key information like warranty and insurance status
- Click "Manage Vehicles" to add, edit, or remove vehicles

#### Recent Activity
- Timeline of recent maintenance activities
- Shows what was done and when
- Helps track maintenance patterns

#### Quick Actions
- **Log Maintenance:** Record new maintenance activity
- **Add Receipt:** Upload and organize receipts
- **Add Vehicle:** Register a new vehicle
- **Sync Data:** Update from cloud storage

## Managing Vehicles

### Adding a New Vehicle

1. **Navigate to Vehicle Manager**
   - Click "Vehicles" in the navigation bar
   - Or click "Add Vehicle" from the dashboard

2. **Fill in Vehicle Information**
   - **Required Fields:**
     - Make (e.g., Toyota, Ford, Honda)
     - Model (e.g., Camry, F-150, Civic)
     - Year (e.g., 2020)
   
   - **Optional Fields:**
     - Color
     - VIN (Vehicle Identification Number)
     - License Plate
     - Current Mileage
     - Purchase Date
     - Warranty Expiration
     - Insurance Expiration
     - Registration Expiration

3. **Upload Vehicle Photo**
   - Click "Choose File" under Vehicle Photo
   - Select an image from your device
   - The photo will be stored securely in the cloud

4. **Save Your Vehicle**
   - Click "Save Vehicle" to add it to your system
   - The vehicle will appear in your vehicle list

### Editing Vehicle Information

1. **Find Your Vehicle**
   - Go to the Vehicle Manager page
   - Locate the vehicle you want to edit

2. **Click Edit**
   - Click the pencil icon (✏️) next to the vehicle
   - The edit form will open with current information

3. **Make Changes**
   - Update any information as needed
   - All fields can be modified except the vehicle ID

4. **Save Changes**
   - Click "Update Vehicle" to save your changes

### Monitoring Vehicle Status

The vehicle list shows important status information:

- **Warranty Status:** Green (valid), Yellow (expiring soon), Red (expired)
- **Insurance Status:** Color-coded based on expiration date
- **Registration Status:** Shows renewal requirements
- **Current Mileage:** Helps track usage and maintenance needs

## Logging Maintenance

### Quick Maintenance Entry

For common maintenance tasks, use the quick action buttons:

1. **Oil Change**
   - Click the "Oil Change" quick action
   - Form pre-fills with oil change details
   - Add specific information like oil type and filter

2. **Tire Rotation**
   - Click "Tire Rotation" for quick entry
   - Record mileage and any tire condition notes

3. **Inspection**
   - Use for annual inspections or safety checks
   - Record inspection results and any issues found

4. **Repair**
   - For general repair work
   - Describe the problem and solution

### Detailed Maintenance Logging

1. **Start New Entry**
   - Click "Log Maintenance" button
   - Select the vehicle from the dropdown

2. **Choose Maintenance Type**
   - Select from predefined types or choose "Other"
   - Each type may show additional relevant fields

3. **Enter Service Details**
   - **Service Date:** When the work was performed
   - **Current Mileage:** Vehicle mileage at time of service
   - **Cost:** Total cost of the service
   - **Service Provider:** Who performed the work
   - **Description:** Detailed notes about the work

4. **Set Next Service Reminder**
   - **Next Service Mileage:** When next service is due
   - **Next Service Date:** Calendar-based reminder

5. **Add Photos**
   - Upload photos of the work performed
   - Before and after photos are helpful
   - Multiple photos can be uploaded

6. **Save the Record**
   - Click "Save Maintenance" to log the entry
   - The record will appear in your maintenance history

### Maintenance History

View all maintenance records in the Maintenance Log:

- **Filter by Vehicle:** See maintenance for specific vehicles
- **Filter by Type:** Focus on specific maintenance types
- **Date Range:** View maintenance within specific time periods
- **Search:** Find specific records by description or provider

## Managing Receipts

### Adding Receipts

1. **Upload Receipt Image**
   - Click "Add Receipt" button
   - Take a photo with your device camera or upload existing image
   - The image will be stored securely in the cloud

2. **Enter Receipt Details**
   - **Vendor:** Who you paid (e.g., "Joe's Auto Shop")
   - **Amount:** Total cost from the receipt
   - **Date:** When the service was performed
   - **Vehicle:** Which vehicle the receipt is for
   - **Category:** Type of service (Oil Change, Tire Service, etc.)
   - **Description:** Additional notes about the service

3. **Link to Maintenance Record (Optional)**
   - If you've already logged the maintenance, you can link the receipt
   - Select the corresponding maintenance record from the dropdown

4. **Save Receipt**
   - Click "Save Receipt" to add it to your collection

### Organizing Receipts

#### View Modes
- **Grid View:** See receipt images in a photo gallery format
- **List View:** See receipt details in a table format

#### Filtering and Searching
- **Vehicle Filter:** Show receipts for specific vehicles
- **Category Filter:** Focus on specific types of services
- **Date Range:** View receipts from specific time periods
- **Search:** Find receipts by vendor name or description

#### Sorting Options
- **Date (Newest/Oldest):** Sort by receipt date
- **Amount (High to Low/Low to High):** Sort by cost
- **Vendor:** Alphabetical by vendor name

### Receipt Analytics

The receipt manager shows helpful statistics:

- **Total Receipts:** Number of receipts stored
- **Total Amount:** Sum of all receipt amounts
- **This Month:** Spending for the current month
- **This Year:** Annual spending total

### Exporting Receipts

For tax purposes or record keeping:

1. **Click Export Button**
   - Choose your export format (CSV, PDF, or JSON)
   - Select date range for export

2. **Choose Date Range**
   - All Time: Export everything
   - This Year: Current year only
   - This Quarter: Current quarter
   - This Month: Current month only
   - Custom Range: Specify exact dates

3. **Download File**
   - The export file will download to your device
   - Use for tax preparation or accounting software

## Mobile Usage

Vehicle Maintenance Manager is designed to work perfectly on mobile devices.

### Mobile Features

#### Touch-Optimized Interface
- Large buttons and touch targets
- Swipe-friendly navigation
- Responsive design adapts to screen size

#### Camera Integration
- Take photos directly from the app
- Upload vehicle photos and maintenance documentation
- Capture receipts on the go

#### Offline Capability
- App works without internet connection
- Data stored locally until sync is available
- Automatic sync when connection is restored

### Mobile Best Practices

1. **Use Camera for Receipts**
   - Take photos immediately after service
   - Ensure receipt is clearly visible and readable
   - Good lighting improves image quality

2. **Quick Entry on the Go**
   - Use quick action buttons for common maintenance
   - Voice-to-text can speed up description entry
   - Save detailed entry for later if needed

3. **Regular Syncing**
   - Sync data when on Wi-Fi to save mobile data
   - Check sync status regularly
   - Backup important data before major updates

## Data Management

### Cloud Synchronization

Your data is automatically backed up to Google Sheets and Google Drive:

- **Google Sheets:** Stores all vehicle and maintenance data
- **Google Drive:** Stores uploaded images and photos
- **Real-time Sync:** Changes sync automatically when online
- **Offline Support:** Works without internet, syncs when reconnected

### Data Security

- **Private Storage:** All data stored in your personal Google account
- **Secure Access:** Google's security protects your information
- **No Third-Party Sharing:** Your data is never shared with others
- **Full Control:** You own and control all your data

### Backup and Export

#### Automatic Backups
- Data automatically backed up to Google Sheets
- Images stored in Google Drive with version history
- Google's infrastructure provides redundant storage

#### Manual Exports
- Export maintenance records to CSV
- Export receipts with images
- Download data for local backup or migration

### Data Privacy

- **Local Storage:** Some data cached locally for offline use
- **Secure Transmission:** All data encrypted in transit
- **Access Control:** Only you can access your data
- **Deletion Rights:** You can delete all data at any time

## Tips and Best Practices

### Getting the Most from Your App

#### Regular Maintenance Logging
- Log maintenance immediately after service
- Include photos for better documentation
- Set reminders for future maintenance
- Track costs to budget for vehicle expenses

#### Receipt Management
- Photograph receipts immediately
- Organize by category for easy tax preparation
- Link receipts to maintenance records
- Export annually for tax purposes

#### Vehicle Monitoring
- Update mileage regularly
- Monitor warranty and insurance expiration dates
- Set calendar reminders for important dates
- Review maintenance history before major services

### Efficiency Tips

#### Use Quick Actions
- Quick action buttons save time for common tasks
- Customize descriptions for your specific needs
- Use consistent naming for service providers

#### Batch Processing
- Upload multiple receipts at once
- Review and update multiple vehicles together
- Export data in batches for record keeping

#### Mobile Optimization
- Take photos in good lighting
- Use voice-to-text for faster data entry
- Sync regularly to prevent data loss

### Cost Management

#### Track Spending Patterns
- Review monthly and annual spending
- Compare costs between service providers
- Budget for upcoming major maintenance

#### Warranty Tracking
- Monitor warranty expiration dates
- Schedule warranty work before expiration
- Keep warranty documentation with vehicle records

#### Insurance and Registration
- Set reminders for renewal dates
- Track insurance claims related to maintenance
- Keep registration current to avoid penalties

## Troubleshooting

### Common Issues and Solutions

#### App Not Loading
**Problem:** Application doesn't load or shows blank page
**Solutions:**
1. Refresh the browser page
2. Clear browser cache and cookies
3. Try a different browser
4. Check internet connection
5. Contact support if problem persists

#### Data Not Syncing
**Problem:** Changes not appearing across devices
**Solutions:**
1. Check internet connection
2. Click "Sync Data" button manually
3. Verify Google Apps Script configuration
4. Check browser console for error messages
5. Try logging out and back in

#### Images Not Uploading
**Problem:** Photos won't upload or appear
**Solutions:**
1. Check image file size (should be under 5MB)
2. Ensure image is in supported format (JPG, PNG)
3. Check internet connection
4. Try uploading from a different device
5. Verify Google Drive has available storage

#### Mobile Issues
**Problem:** App doesn't work properly on mobile
**Solutions:**
1. Update your mobile browser
2. Clear browser cache
3. Try landscape orientation
4. Ensure touch targets are working
5. Check for JavaScript errors in browser

### Error Messages

#### "Google Apps Script web app URL not configured"
- This is normal if cloud sync isn't set up
- App will work with local storage only
- Contact administrator for cloud sync setup

#### "Upload failed"
- Check internet connection
- Verify file size and format
- Try uploading again
- Contact support if problem continues

#### "Sync failed - working offline"
- App is working in offline mode
- Data will sync when connection is restored
- Continue using app normally

### Getting Help

#### Self-Help Resources
1. Check this user manual for guidance
2. Review error messages for specific issues
3. Try basic troubleshooting steps
4. Check browser console for technical details

#### Contact Support
If you can't resolve an issue:
1. Note the specific error message
2. Document steps that led to the problem
3. Include browser and device information
4. Contact support with details

## Support

### Technical Support

**Superior Networks LLC**
- **Developer:** Dwain Henderson Jr.
- **Phone:** (937) 985-2480
- **Address:** 703 Jefferson St. Dayton Ohio, 45342
- **Email:** Contact through phone for email address
- **Support Hours:** Business hours, Monday-Friday

### What to Include When Contacting Support

1. **Problem Description:** Clear description of the issue
2. **Error Messages:** Exact text of any error messages
3. **Browser Information:** Which browser and version you're using
4. **Device Information:** Computer, tablet, or mobile device details
5. **Steps to Reproduce:** What you were doing when the problem occurred

### Response Times

- **Critical Issues:** Same business day response
- **General Questions:** Within 1-2 business days
- **Feature Requests:** Acknowledged within 1 week

### Training and Onboarding

Custom training sessions available for:
- Business teams
- Multiple user setups
- Advanced feature usage
- Integration with existing systems

Contact support to schedule training sessions.

---

## Conclusion

Vehicle Maintenance Manager is designed to make vehicle maintenance tracking simple and efficient. By following this user manual and implementing the best practices outlined, you'll be able to:

- Keep detailed records of all vehicle maintenance
- Stay on top of important dates and reminders
- Manage receipts for tax and warranty purposes
- Access your data from any device, anywhere
- Make informed decisions about vehicle care and costs

Thank you for choosing Vehicle Maintenance Manager. We're committed to helping you keep your vehicles running smoothly and your records organized.

---

**© 2025 Superior Networks LLC. All rights reserved.**  
**Developed by Dwain Henderson Jr.**

