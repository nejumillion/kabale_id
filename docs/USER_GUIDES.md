# User Guides

## Table of Contents

- [Citizen Guide](#citizen-guide)
- [Kabale Administrator Guide](#kabale-administrator-guide)
- [System Administrator Guide](#system-administrator-guide)

## Citizen Guide

### Overview

As a citizen, you can register for an account, create your profile, apply for a digital ID card, and track your application status. Your digital ID will be issued after in-person verification at your selected Kabale office.

### Getting Started

#### 1. Register an Account

1. Visit the application homepage
2. Click **"Register"** or navigate to `/register`
3. Fill in the registration form:
   - **First Name** (required)
   - **Last Name** (required)
   - **Email** (at least one of email or phone required)
   - **Phone** (optional, but required if no email)
   - **Password** (minimum 8 characters)
   - **Confirm Password**
4. Click **"Register"**
5. You'll be automatically logged in and redirected

**Note**: You must provide either an email address or phone number (or both).

#### 2. Create Your Profile

After registration, you'll be redirected to create your profile:

1. Fill in your personal information:
   - **Date of Birth** (required)
   - **Gender** (optional)
   - **Phone** (optional, if not provided during registration)
   - **Address** (optional)
   - **Photo** (optional - upload a profile photo)
2. **Select a Kabale** from the dropdown (required)
   - This is the Kabale office where you'll go for in-person verification
   - Choose the Kabale closest to you or most convenient
3. Click **"Create Profile"**

**Important**: You must select a Kabale to complete your profile. This Kabale will handle your ID application verification.

#### 3. Apply for a Digital ID

Once your profile is created:

1. Navigate to **"My Applications"** from the citizen dashboard
2. Click **"New Application"** or **"Apply for ID"**
3. Select your preferred Kabale (if you want to change from your profile default)
4. Click **"Create Application"**

Your application will be created in **DRAFT** status.

#### 4. Submit Your Application

1. Review your application details
2. Click **"Submit Application"**
3. Your application status changes to **SUBMITTED**

**Note**: Once submitted, you cannot edit the application. Make sure all information is correct before submitting.

#### 5. Visit Kabale Office for Verification

After submission:

1. Your application will move to **PENDING_VERIFICATION** status
2. Visit the Kabale office you selected
3. Bring valid identification documents
4. A Kabale administrator will verify your identity in person
5. The administrator will approve or reject your application

#### 6. Track Application Status

You can view your application status at any time:

1. Navigate to **"My Applications"** from the dashboard
2. View the status of each application:
   - **DRAFT**: Not yet submitted
   - **SUBMITTED**: Submitted, awaiting processing
   - **PENDING_VERIFICATION**: Waiting for in-person verification
   - **APPROVED**: Verified and approved - Digital ID issued
   - **REJECTED**: Application was rejected

#### 7. View Your Digital ID

Once your application is approved:

1. Navigate to **"My Digital IDs"** from the dashboard
2. Click on your active digital ID
3. View your digital ID card
4. **Download PDF**: Click "Download" to get a PDF copy of your ID

**Features of Digital ID**:
- Contains your personal information
- Includes a QR code for verification
- Can be downloaded as PDF
- Official and verifiable

### Managing Your Account

#### Update Profile

1. Navigate to **"Profile"** from the menu
2. Update your information:
   - First Name
   - Last Name
   - Email
   - Phone
3. Click **"Save Changes"**

#### Change Password

1. Navigate to **"Profile"** → **"Change Password"**
2. Enter:
   - Current password
   - New password (minimum 8 characters)
   - Confirm new password
3. Click **"Update Password"**

### Application Lifecycle

```
DRAFT → SUBMITTED → PENDING_VERIFICATION → APPROVED/REJECTED
```

- **DRAFT**: You can edit or delete the application
- **SUBMITTED**: Application is locked, awaiting admin review
- **PENDING_VERIFICATION**: Visit Kabale office for verification
- **APPROVED**: Digital ID is issued and active
- **REJECTED**: Application was rejected (you can create a new application)

### Frequently Asked Questions

**Q: Can I have multiple applications?**  
A: You can have multiple applications, but only one can be active at a time. If you have a rejected application, you can create a new one.

**Q: What if I forget my password?**  
A: Contact system administrators for password reset assistance.

**Q: Can I change my selected Kabale after submitting?**  
A: No, once submitted, you cannot change the Kabale. You would need to create a new application.

**Q: How long does verification take?**  
A: Verification happens during your in-person visit. The administrator will process it immediately.

**Q: What if my application is rejected?**  
A: You can create a new application. Check with the Kabale administrator about the reason for rejection.

## Kabale Administrator Guide

### Overview

As a Kabale Administrator, you manage ID applications for your assigned Kabale. You verify citizens in person and approve or reject their applications.

### Getting Started

#### 1. Access Your Dashboard

1. Log in with your Kabale Administrator credentials
2. You'll be redirected to the Kabale Admin dashboard
3. The dashboard shows:
   - Your assigned Kabale information
   - Applications pending verification
   - Statistics (total applications, approved, rejected, etc.)

### Managing Applications

#### 1. View Applications

1. Navigate to **"Applications"** from the menu
2. View all applications for your Kabale:
   - **DRAFT**: Not yet submitted (informational only)
   - **SUBMITTED**: Ready for processing
   - **PENDING_VERIFICATION**: Waiting for in-person verification
   - **APPROVED**: Already approved
   - **REJECTED**: Already rejected

#### 2. Move Application to Verification

When a citizen submits an application:

1. Find the application in **"Applications"**
2. Review the citizen's information
3. Click **"Move to Verification"** or **"Start Verification"**
4. The status changes to **PENDING_VERIFICATION**

**Note**: This indicates the citizen should visit your office for verification.

#### 3. Verify Citizen In Person

When a citizen visits your office:

1. Ask them to provide identification documents
2. Verify their identity matches the application
3. Check their documents are valid
4. Confirm their information is accurate

#### 4. Approve Application

After successful verification:

1. Open the application in **PENDING_VERIFICATION** status
2. Review all information
3. Add verification notes (optional)
4. Click **"Approve"**
5. The system will:
   - Create a verification log
   - Change application status to **APPROVED**
   - Generate a Digital ID for the citizen
   - Notify the citizen (if notifications are enabled)

#### 5. Reject Application

If verification fails or information is incorrect:

1. Open the application in **PENDING_VERIFICATION** status
2. Add rejection notes explaining the reason (required)
3. Click **"Reject"**
4. The system will:
   - Create a verification log
   - Change application status to **REJECTED**
   - Notify the citizen (if notifications are enabled)

**Important**: Always provide clear rejection notes so citizens understand why their application was rejected.

### Viewing Citizens

#### 1. View All Citizens

1. Navigate to **"Citizens"** from the menu
2. View all citizens who have applications for your Kabale
3. See their:
   - Personal information
   - Application status
   - Digital ID status

#### 2. View Citizen Details

1. Click on a citizen from the list
2. View their:
   - Full profile information
   - All applications for your Kabale
   - Digital IDs (if any)
   - Verification history

### Viewing Digital IDs

1. Navigate to **"Digital IDs"** from the menu
2. View all digital IDs issued for applications in your Kabale
3. See:
   - Citizen information
   - Issue date
   - Status (ACTIVE, REVOKED, EXPIRED)

### Best Practices

1. **Verify Promptly**: Process applications as citizens visit your office
2. **Clear Notes**: Always add clear notes when rejecting applications
3. **Verify Identity**: Always verify identity documents in person
4. **Check Information**: Verify all application information is accurate
5. **Maintain Records**: Keep physical records of verification if required by policy

### Important Notes

- You can only access applications for your assigned Kabale
- You cannot access other Kabales' data
- Verification logs are permanent and cannot be modified
- Only System Administrators can revoke digital IDs

## System Administrator Guide

### Overview

As a System Administrator, you have full access to manage the entire system. You can create and manage Kabales, assign administrators, manage users, view all data, and configure system settings.

### Getting Started

#### 1. Access Your Dashboard

1. Log in with your System Administrator credentials
2. You'll be redirected to the System Admin dashboard
3. The dashboard shows:
   - System-wide statistics
   - Total users, Kabales, applications, digital IDs
   - Status breakdowns
   - Recent activity

### Managing Kabales

#### 1. View All Kabales

1. Navigate to **"Kabales"** from the menu
2. View all Kabales in the system
3. See:
   - Kabale name and address
   - Number of administrators
   - Number of applications

#### 2. Create a New Kabale

1. Click **"Create Kabale"** or **"New Kabale"**
2. Fill in:
   - **Name** (required)
   - **Address** (optional)
3. Click **"Create"**

#### 3. Edit a Kabale

1. Click on a Kabale from the list
2. Click **"Edit"**
3. Update:
   - Name
   - Address
4. Click **"Save Changes"**

**Note**: You cannot delete a Kabale that has applications.

#### 4. View Kabale Details

1. Click on a Kabale from the list
2. View:
   - Kabale information
   - Assigned administrators
   - Applications for this Kabale
   - Statistics

### Managing Users

#### 1. View All Users

1. Navigate to **"Users"** from the menu
2. View all users (System Admins and Kabale Admins)
3. See:
   - User information
   - Role
   - Assigned Kabale (for Kabale Admins)
   - Account status

#### 2. Create a New User

1. Click **"Create User"** or **"New User"**
2. Fill in:
   - **First Name** (required)
   - **Last Name** (required)
   - **Email** (at least one of email or phone required)
   - **Phone** (optional)
   - **Password** (minimum 8 characters)
   - **Role**: Select SYSTEM_ADMIN or KABALE_ADMIN
   - **Kabale** (required if role is KABALE_ADMIN)
3. Click **"Create"**

#### 3. Edit a User

1. Click on a user from the list
2. Click **"Edit"**
3. Update:
   - First Name, Last Name
   - Email, Phone
   - Role (can change roles)
   - Kabale assignment (for Kabale Admins)
   - Password (optional)
4. Click **"Save Changes"**

#### 4. View User Details

1. Click on a user from the list
2. View:
   - Full user information
   - Role and permissions
   - Assigned Kabale (if Kabale Admin)
   - Recent activity
   - Session information

### Managing Citizens

#### 1. View All Citizens

1. Navigate to **"Citizens"** from the menu
2. View all citizens in the system
3. See:
   - Citizen information
   - Applications
   - Digital IDs

#### 2. View Citizen Details

1. Click on a citizen from the list
2. View:
   - Full profile information
   - All applications (across all Kabales)
   - All digital IDs
   - Application history

### Managing Applications

#### 1. View All Applications

1. Navigate to **"Applications"** from the menu
2. View all applications across all Kabales
3. Filter by:
   - Status
   - Kabale
   - Date range
4. See:
   - Citizen information
   - Kabale information
   - Status and dates
   - Verification logs

#### 2. View Application Details

1. Click on an application from the list
2. View:
   - Full application information
   - Citizen profile
   - Kabale information
   - Verification logs
   - Digital ID (if approved)

**Note**: As System Admin, you can view all applications but typically don't approve/reject them (that's done by Kabale Admins).

### Managing Digital IDs

#### 1. View All Digital IDs

1. Navigate to **"Digital IDs"** from the menu
2. View all digital IDs in the system
3. Filter by:
   - Status (ACTIVE, REVOKED, EXPIRED)
   - Kabale
   - Date range
4. See:
   - Citizen information
   - Issue date
   - Status
   - Revocation information (if revoked)

#### 2. Revoke a Digital ID

If a digital ID needs to be revoked:

1. Find the digital ID in the list
2. Click **"Revoke"** or **"Revoke ID"**
3. Enter a reason for revocation (required)
4. Click **"Confirm Revocation"**
5. The digital ID status changes to **REVOKED**

**Important**: Revocation is permanent and should only be done when necessary (e.g., fraud, loss, etc.).

### ID Design Configuration

#### 1. View Current Design

1. Navigate to **"ID Design"** from the menu
2. View the current active ID card design configuration
3. See design settings and preview

#### 2. Update ID Design

1. Click **"Edit Design"** or **"Update Design"**
2. Modify design settings:
   - Colors
   - Layout
   - Fonts
   - Logo
   - QR code settings
   - Other design elements
3. Preview the design
4. Click **"Save Design"**

**Note**: Only one design configuration can be active at a time. Updating the design will deactivate the previous one.

### System Statistics

The dashboard provides comprehensive statistics:

- **Users**: Total users by role
- **Kabales**: Total Kabales and their distribution
- **Applications**: Total and by status
- **Digital IDs**: Total and by status
- **Trends**: Growth over time (if analytics are enabled)

### Best Practices

1. **Regular Monitoring**: Check system statistics regularly
2. **User Management**: Regularly review and update user accounts
3. **Kabale Management**: Ensure all Kabales have assigned administrators
4. **Security**: Regularly review access logs and user activity
5. **Backups**: Ensure regular database backups are performed
6. **Documentation**: Keep system documentation up to date

### Important Notes

- You have full access to all data in the system
- You can revoke digital IDs (this is permanent)
- You cannot delete Kabales with applications
- You can change user roles and assignments
- All your actions are logged for audit purposes

### Administrative Tasks

#### Regular Maintenance

1. **Review Applications**: Periodically review pending applications
2. **Monitor Users**: Check for inactive or problematic accounts
3. **Update Kabales**: Ensure Kabale information is current
4. **Review Logs**: Check verification logs and system activity
5. **Backup Verification**: Verify backups are working correctly

#### Security Tasks

1. **Password Policies**: Ensure users follow password policies
2. **Access Review**: Regularly review user access and roles
3. **Session Management**: Monitor active sessions
4. **Audit Logs**: Review audit logs for suspicious activity

## Common Tasks Across All Roles

### Changing Your Password

1. Navigate to **"Profile"** → **"Change Password"**
2. Enter:
   - Current password
   - New password (minimum 8 characters)
   - Confirm new password
3. Click **"Update Password"**

### Updating Your Profile

1. Navigate to **"Profile"**
2. Update your information
3. Click **"Save Changes"**

### Logging Out

1. Click your user menu (usually in the header)
2. Click **"Logout"**
3. You'll be logged out and redirected to the home page

## Getting Help

### For Citizens

- Contact your selected Kabale office for application questions
- Contact system administrators for account issues

### For Kabale Administrators

- Contact system administrators for system issues
- Refer to this guide for application processing

### For System Administrators

- Refer to technical documentation for system issues
- Contact development team for bug reports or feature requests

## Related Documentation

- [Architecture Documentation](ARCHITECTURE.md) - System design overview
- [API Documentation](API.md) - Technical API reference
- [Developer Guide](DEVELOPER.md) - For developers working on the system

