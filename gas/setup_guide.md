# Google Apps Script Setup Guide

## Overview
This guide will help you deploy the Google Apps Script backend for the Vehicle Maintenance Web App.

## Prerequisites
- Google account
- Access to Google Apps Script (script.google.com)
- Basic understanding of Google Sheets and Google Drive

## Step-by-Step Setup

### 1. Create New Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Rename the project to "Vehicle Maintenance Backend"

### 2. Add the Code
1. Delete the default `myFunction()` code
2. Copy the entire contents of `code.gs` into the script editor
3. Save the project (Ctrl+S or Cmd+S)

### 3. Enable Required APIs
1. In the Apps Script editor, click on "Services" (+ icon) in the left sidebar
2. Add the following services if not already enabled:
   - Google Sheets API
   - Google Drive API

### 4. Deploy as Web App
1. Click "Deploy" > "New deployment"
2. Choose type: "Web app"
3. Fill in the deployment settings:
   - **Description**: "Vehicle Maintenance API v1.0"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (for public access)
4. Click "Deploy"
5. **Important**: Copy the Web App URL - you'll need this for the frontend configuration

### 5. Test the Installation
1. In the Apps Script editor, select the `testInstallation` function
2. Click "Run" to test the setup
3. Check the execution log for any errors
4. If successful, you should see a new Google Sheet created named "Vehicle Maintenance Data"

### 6. Configure Frontend
1. Open the web app in a browser
2. Go to Settings or Configuration
3. Enter the Web App URL you copied in step 4
4. Test the connection by adding a vehicle or maintenance record

## Troubleshooting

### Common Issues

#### Permission Errors
- Make sure you've authorized the script to access Google Sheets and Drive
- Check that the deployment has "Anyone" access if you want public access

#### CORS Errors
- The script includes CORS headers, but if you still get errors, try:
  - Redeploying the web app
  - Clearing browser cache
  - Using a different browser

#### Data Not Saving
- Check the Apps Script execution log for errors
- Verify that the Google Sheet was created successfully
- Make sure the sheet has the correct column headers

### Viewing Logs
1. In Apps Script editor, click "Executions" in the left sidebar
2. Click on any execution to see detailed logs
3. Look for error messages or console.log outputs

## Security Considerations

### For Production Use
1. **Change Access Level**: Set "Who has access" to "Anyone with Google account" instead of "Anyone"
2. **Add Authentication**: Implement proper user authentication
3. **Validate Input**: Add more robust input validation
4. **Rate Limiting**: Consider implementing rate limiting for API calls

### Data Privacy
- The Google Sheet and Drive folder will be created in your Google account
- Make sure to set appropriate sharing permissions
- Consider using a dedicated Google account for the application

## Maintenance

### Updating the Code
1. Make changes in the Apps Script editor
2. Save the project
3. Create a new deployment or update the existing one
4. Test thoroughly before using in production

### Monitoring
- Regularly check the Apps Script execution logs
- Monitor Google Drive storage usage for uploaded images
- Keep track of API usage quotas

## Support

### Google Apps Script Limits
- **Execution time**: 6 minutes per execution
- **Triggers**: 20 time-based triggers per script
- **Storage**: Limited by Google Drive quota
- **API calls**: Subject to Google's quotas

### Getting Help
- Google Apps Script documentation: [developers.google.com/apps-script](https://developers.google.com/apps-script)
- Stack Overflow: Search for "google-apps-script" tag
- Google Apps Script community: [groups.google.com/forum/#!forum/google-apps-script-community](https://groups.google.com/forum/#!forum/google-apps-script-community)

## Advanced Configuration

### Custom Spreadsheet
If you want to use an existing spreadsheet:
1. Open the spreadsheet in Google Sheets
2. Note the spreadsheet ID from the URL
3. Modify the `getOrCreateSpreadsheet()` function in the code
4. Replace the creation logic with `SpreadsheetApp.openById('YOUR_SPREADSHEET_ID')`

### Custom Drive Folder
To use a specific Google Drive folder:
1. Create the folder in Google Drive
2. Note the folder ID from the URL when viewing the folder
3. Modify the `getOrCreateDriveFolder()` function in the code
4. Replace the creation logic with `DriveApp.getFolderById('YOUR_FOLDER_ID')`

### Environment Variables
For different environments (development, staging, production):
1. Create separate Apps Script projects
2. Use different spreadsheet and folder names
3. Deploy with different access levels
4. Update the frontend configuration accordingly

## Backup and Recovery

### Backing Up Data
- The Google Sheet serves as your primary data backup
- Consider exporting the sheet regularly as CSV or Excel
- Google Drive automatically versions your files

### Recovery Procedures
1. **Lost Script**: The code is in your `code.gs` file - keep a local backup
2. **Corrupted Sheet**: Use Google Sheets version history to restore
3. **Lost Images**: Check Google Drive trash and version history

## Performance Optimization

### For Large Datasets
- Consider implementing pagination for large data sets
- Use batch operations when possible
- Implement caching strategies
- Monitor execution time and optimize slow functions

### Image Storage
- Compress images before upload
- Consider image size limits
- Implement cleanup procedures for old images
- Monitor Google Drive storage usage

