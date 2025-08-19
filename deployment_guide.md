# Vehicle Maintenance Manager - Deployment Guide

**Version:** 1.0.0  
**Copyright:** 2025 Superior Networks LLC  
**Developer:** Dwain Henderson Jr.

## Overview

This guide provides step-by-step instructions for deploying the Vehicle Maintenance Manager web application. The deployment process involves setting up both the frontend web application and the Google Apps Script backend.

## Deployment Options

### Option 1: Local/Network Deployment
- Host files on a local web server
- Access via local network
- Suitable for personal or small business use

### Option 2: Web Hosting Deployment
- Upload files to web hosting service
- Access via internet
- Suitable for broader access needs

### Option 3: Google Sites Integration
- Embed in Google Sites
- Leverage Google ecosystem
- Suitable for Google Workspace users

## Prerequisites

### Required Accounts & Services
- Google account (for backend integration)
- Web hosting service (if deploying online)
- Modern web browser for testing

### Technical Requirements
- Web server capable of serving static files
- HTTPS support (recommended for production)
- Modern browser support (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

## Step-by-Step Deployment

### Phase 1: Prepare the Application Files

#### 1.1 Download and Extract
1. Download the complete application package
2. Extract to a temporary directory
3. Verify all files are present:
   ```
   vehicle_maintenance_app/
   ├── index.html
   ├── vehicle_manager.html
   ├── maintenance_log.html
   ├── receipt_manager.html
   ├── css/styles.css
   ├── js/ (5 JavaScript files)
   ├── gas/ (Google Apps Script files)
   └── documentation files
   ```

#### 1.2 Review Configuration
1. Open `js/google_sheets.js`
2. Note the `GOOGLE_CONFIG` section (will be configured later)
3. Review `js/app.js` for any environment-specific settings

### Phase 2: Set Up Google Apps Script Backend

#### 2.1 Create Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Sign in with your Google account
3. Click "New Project"
4. Rename project to "Vehicle Maintenance Backend"

#### 2.2 Add Backend Code
1. Delete the default `myFunction()` code
2. Copy entire contents of `gas/code.gs`
3. Paste into the script editor
4. Save the project (Ctrl+S or Cmd+S)

#### 2.3 Enable Required Services
1. In the left sidebar, click "Services" (+ icon)
2. Add these services if not already enabled:
   - Google Sheets API
   - Google Drive API
3. Save the project

#### 2.4 Test the Backend
1. Select the `testInstallation` function from dropdown
2. Click "Run" button
3. Authorize the script when prompted
4. Check execution log for success message
5. Verify a new Google Sheet was created named "Vehicle Maintenance Data"

#### 2.5 Deploy as Web App
1. Click "Deploy" > "New deployment"
2. Choose type: "Web app"
3. Configure deployment settings:
   - **Description:** "Vehicle Maintenance API v1.0"
   - **Execute as:** "Me"
   - **Who has access:** "Anyone" (for public access) or "Anyone with Google account" (for restricted access)
4. Click "Deploy"
5. **IMPORTANT:** Copy the Web App URL - you'll need this for frontend configuration
6. Test the deployment by visiting the URL in a browser

### Phase 3: Deploy Frontend Application

#### Option A: Local Web Server Deployment

##### 3.1 Set Up Local Web Server
**Using Python (if installed):**
```bash
cd vehicle_maintenance_app
python -m http.server 8080
```

**Using Node.js (if installed):**
```bash
cd vehicle_maintenance_app
npx http-server -p 8080
```

**Using PHP (if installed):**
```bash
cd vehicle_maintenance_app
php -S localhost:8080
```

##### 3.2 Access Application
1. Open browser and go to `http://localhost:8080`
2. Verify the dashboard loads correctly
3. Test navigation between pages

#### Option B: Web Hosting Deployment

##### 3.1 Choose Hosting Provider
Popular options:
- **Netlify** (free tier available, easy deployment)
- **Vercel** (free tier available, Git integration)
- **GitHub Pages** (free for public repositories)
- **Traditional web hosting** (cPanel, FTP upload)

##### 3.2 Upload Files
**For Netlify/Vercel:**
1. Create account and new project
2. Upload the entire `vehicle_maintenance_app` folder
3. Configure build settings (none needed for static files)
4. Deploy and note the provided URL

**For Traditional Hosting:**
1. Connect via FTP/SFTP or file manager
2. Upload all files to public_html or www directory
3. Ensure file permissions are correct (644 for files, 755 for directories)
4. Test access via your domain

##### 3.3 Configure HTTPS
1. Enable SSL certificate through hosting provider
2. Update any hardcoded HTTP URLs to HTTPS
3. Test all functionality with HTTPS enabled

#### Option C: Google Sites Integration

##### 3.1 Create Google Site
1. Go to [sites.google.com](https://sites.google.com)
2. Create a new site
3. Choose appropriate template

##### 3.2 Embed Application
1. Add an "Embed" component to your site
2. Use the "Embed code" option
3. Create iframe code pointing to your hosted application:
   ```html
   <iframe src="https://your-app-url.com" width="100%" height="800px" frameborder="0"></iframe>
   ```

### Phase 4: Configure Frontend-Backend Connection

#### 4.1 Configure Google Apps Script URL
1. Open the deployed application in a browser
2. Open browser developer tools (F12)
3. Go to Console tab
4. Execute this command (replace with your actual URL):
   ```javascript
   window.GoogleSheets.configure('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
   ```
5. Alternatively, you can modify the `js/google_sheets.js` file directly:
   ```javascript
   const GOOGLE_CONFIG = {
       webAppUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
       // ... rest of config
   };
   ```

#### 4.2 Test Integration
1. Try adding a test vehicle
2. Check if data appears in the Google Sheet
3. Test maintenance logging
4. Verify receipt upload functionality
5. Check browser console for any errors

### Phase 5: Production Configuration

#### 5.1 Security Hardening
1. **Google Apps Script Access:**
   - Change "Who has access" to "Anyone with Google account" for better security
   - Consider implementing additional authentication

2. **HTTPS Enforcement:**
   - Ensure all traffic uses HTTPS
   - Update any mixed content issues

3. **Data Validation:**
   - Review input validation in both frontend and backend
   - Test with various input types and sizes

#### 5.2 Performance Optimization
1. **Image Optimization:**
   - Implement client-side image compression
   - Set reasonable file size limits

2. **Caching:**
   - Configure appropriate cache headers
   - Enable browser caching for static assets

3. **Monitoring:**
   - Set up Google Apps Script execution monitoring
   - Monitor Google Drive storage usage

#### 5.3 Backup Strategy
1. **Automated Backups:**
   - Set up regular Google Sheets exports
   - Consider Google Takeout for comprehensive backups

2. **Version Control:**
   - Keep copies of all application files
   - Document any customizations made

### Phase 6: User Training and Documentation

#### 6.1 Create User Documentation
1. Customize the README.md for your specific deployment
2. Create quick start guides for end users
3. Document any custom configurations or modifications

#### 6.2 Training Materials
1. Create video tutorials for common tasks
2. Prepare FAQ document based on expected user questions
3. Set up support channels (email, phone, etc.)

## Post-Deployment Checklist

### Functionality Testing
- [ ] Dashboard loads and displays correctly
- [ ] Vehicle management (add, edit, delete) works
- [ ] Maintenance logging functions properly
- [ ] Receipt upload and management works
- [ ] Data syncs with Google Sheets
- [ ] Mobile responsiveness verified
- [ ] All navigation links work correctly

### Security Verification
- [ ] HTTPS enabled and working
- [ ] Google Apps Script permissions configured appropriately
- [ ] No sensitive data exposed in client-side code
- [ ] Input validation working on both frontend and backend

### Performance Testing
- [ ] Page load times acceptable
- [ ] Image uploads work within reasonable time
- [ ] Google Apps Script executions complete successfully
- [ ] No memory leaks or performance issues

### User Experience
- [ ] All forms validate properly
- [ ] Error messages are user-friendly
- [ ] Success notifications work
- [ ] Mobile interface is touch-friendly

## Troubleshooting Common Deployment Issues

### Frontend Issues

#### Application Not Loading
**Symptoms:** Blank page or JavaScript errors
**Solutions:**
1. Check browser console for errors
2. Verify all files uploaded correctly
3. Check file permissions (644 for files, 755 for directories)
4. Ensure web server serves .js and .css files with correct MIME types

#### Navigation Not Working
**Symptoms:** Clicking links doesn't navigate properly
**Solutions:**
1. Verify all HTML files are in the correct location
2. Check for case sensitivity in file names
3. Update navigation links if directory structure changed

### Backend Issues

#### Google Apps Script Errors
**Symptoms:** Data not saving, sync failures
**Solutions:**
1. Check Google Apps Script execution logs
2. Verify web app deployment is active
3. Check permissions and authorization
4. Ensure Google Sheets and Drive APIs are enabled

#### CORS Errors
**Symptoms:** Cross-origin request blocked errors
**Solutions:**
1. Verify CORS headers in Google Apps Script
2. Check that web app is deployed with correct access settings
3. Ensure frontend is accessing the correct web app URL

### Integration Issues

#### Data Not Syncing
**Symptoms:** Changes not appearing in Google Sheets
**Solutions:**
1. Verify Google Apps Script web app URL is configured correctly
2. Check network connectivity
3. Review browser console for API errors
4. Test Google Apps Script independently

## Maintenance and Updates

### Regular Maintenance Tasks
1. **Monthly:**
   - Review Google Apps Script execution logs
   - Check Google Drive storage usage
   - Verify backup procedures

2. **Quarterly:**
   - Update browser compatibility testing
   - Review and clean up old data
   - Check for security updates

3. **Annually:**
   - Review and update documentation
   - Assess performance and scalability needs
   - Plan for feature updates or improvements

### Update Procedures
1. **Testing Environment:**
   - Always test updates in a separate environment first
   - Verify all functionality after updates
   - Check mobile compatibility

2. **Production Updates:**
   - Schedule updates during low-usage periods
   - Backup all data before updates
   - Have rollback plan ready
   - Monitor for issues after deployment

## Support and Resources

### Technical Support
- **Developer:** Dwain Henderson Jr.
- **Company:** Superior Networks LLC
- **Phone:** (937) 985-2480
- **Address:** 703 Jefferson St. Dayton Ohio, 45342

### Additional Resources
- Google Apps Script Documentation: [developers.google.com/apps-script](https://developers.google.com/apps-script)
- Google Sheets API: [developers.google.com/sheets](https://developers.google.com/sheets)
- Google Drive API: [developers.google.com/drive](https://developers.google.com/drive)

### Community Support
- Stack Overflow: Search for "google-apps-script" tag
- Google Apps Script Community: [groups.google.com/forum/#!forum/google-apps-script-community](https://groups.google.com/forum/#!forum/google-apps-script-community)

---

**© 2025 Superior Networks LLC. All rights reserved.**  
**Developed by Dwain Henderson Jr.**

