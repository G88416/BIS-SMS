# Firebase Rules Deployment Guide

## 🚨 URGENT: Profile Creation Fix Deployment

**If you're here because of the "Missing or insufficient permissions" error affecting users like donald@gmail.com, follow these quick steps:**

### Quick Fix Deployment (5 minutes)

1. **Deploy the updated rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **For affected user (donald@gmail.com):**
   - See `FIX_PROFILE_CREATION_ISSUE.md` for manual profile creation steps
   - OR delete the user from Authentication and recreate them using the fixed admin interface

3. **Test:**
   - Log in as admin
   - Create a test user
   - Verify profile is created in Firestore
   - Test new user can log in

**What was fixed:**
- Added secondary Firebase app instance to prevent admin logout during user creation
- Updated security rules to allow users to create their own profile during initial setup
- See `FIX_PROFILE_CREATION_ISSUE.md` for full details

---

## General Deployment Guide

This guide provides step-by-step instructions for deploying the Firebase Security Rules to your BIS-SMS project.

## Prerequisites

Before deploying, ensure you have:

1. **Node.js and npm** installed on your system
2. **Firebase CLI** installed globally
3. **Access to the Firebase project** (bis-management-system-d77f4)

## Step 1: Install Firebase CLI

If you haven't already installed the Firebase CLI, run:

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 2: Login to Firebase

Authenticate with your Firebase account:

```bash
firebase login
```

This will open a browser window for you to sign in with your Google account that has access to the Firebase project.

## Step 3: Verify Project Configuration

The project is already configured in `.firebaserc`. Verify it:

```bash
firebase use
```

You should see: `Now using alias default (bis-management-system-d77f4)`

If not set, run:
```bash
firebase use bis-management-system-d77f4
```

## Step 4: Test Rules Locally (Optional but Recommended)

Before deploying to production, test the rules using Firebase Emulators:

```bash
firebase emulators:start
```

This will start local emulators for Firestore and Storage where you can test the rules without affecting production data.

## Step 5: Deploy Rules

### Deploy Everything

To deploy all rules and indexes at once:

```bash
firebase deploy
```

### Deploy Specific Components

You can also deploy specific components:

**Deploy only Firestore rules:**
```bash
firebase deploy --only firestore:rules
```

**Deploy only Firestore indexes:**
```bash
firebase deploy --only firestore:indexes
```

**Deploy only Storage rules:**
```bash
firebase deploy --only storage
```

**Deploy Firestore rules and indexes together:**
```bash
firebase deploy --only firestore
```

## Step 6: Verify Deployment

After deployment, verify the rules in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bis-management-system-d77f4**
3. Navigate to **Firestore Database** → **Rules** tab
4. Navigate to **Storage** → **Rules** tab
5. Check that the rules are deployed and show the correct timestamp

## Step 7: Monitor for Issues

After deployment:

1. Monitor the Firebase Console for any error messages
2. Check your application logs for authentication or permission errors
3. Test key user flows (admin, teacher, student, parent) to ensure proper access

## Troubleshooting

### Issue: "Permission Denied" errors in the application

**Solution:** 
- Verify users have the correct `role` field in the `users` collection
- Check that authentication is working properly
- Ensure the user document structure matches the rules expectations

### Issue: "Firebase CLI not found"

**Solution:**
```bash
npm install -g firebase-tools
```

### Issue: "No authorization to access project"

**Solution:**
- Ensure you're logged in: `firebase login`
- Verify you have the correct permissions in the Firebase project
- Contact the project owner to grant you access

### Issue: Rules deployment fails

**Solution:**
- Check rules syntax using: `firebase deploy --only firestore:rules --dry-run`
- Review any error messages in the console
- Ensure you're using the latest Firebase CLI version: `npm update -g firebase-tools`

### Issue: Rules deployed but not taking effect

**Solution:**
- Clear your browser cache and reload the application
- Wait a few minutes for rules to propagate
- Check the Rules tab in Firebase Console to confirm deployment

## Rolling Back Rules

If you need to roll back to previous rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Click on the **Rules history** tab
3. Select a previous version
4. Click **Restore**

Same process for Storage rules.

## Best Practices

1. **Test First**: Always test rules in development/staging before production
2. **Incremental Deployment**: Deploy rules during low-traffic periods
3. **Monitor After Deploy**: Watch for errors in the first 30 minutes after deployment
4. **Keep Backups**: Firebase automatically keeps rule history, but document major changes
5. **Version Control**: All rule changes are tracked in Git
6. **Dry Run**: Use `--dry-run` flag to validate before actual deployment

## Next Steps After Deployment

1. **Set Up Authentication**: Implement Firebase Authentication in your application
2. **Migrate Data**: Move data from localStorage to Firestore
3. **Update Application Code**: Replace localStorage calls with Firestore operations
4. **Test All User Roles**: Verify each role (admin, teacher, student, parent) has correct access
5. **Set Up Monitoring**: Enable Firebase Performance Monitoring and Crashlytics

## Important Security Notes

1. **User Document Structure**: Each user document must have a `role` field
2. **Parent-Child Links**: Parents must have `childrenIds` array in their user document
3. **Class Structure**: Classes must have `teacherId` and `studentIds` fields
4. **Admin Access Only**: Only admins can modify user documents to maintain data integrity

## Getting Help

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review `FIREBASE_RULES.md` for detailed rule explanations
3. Check Firebase Console logs for specific error messages
4. Consult the Firebase community forums

## Deployment Checklist

- [ ] Firebase CLI installed and updated
- [ ] Logged in to Firebase account
- [ ] Project configuration verified
- [ ] Rules tested locally (optional)
- [ ] Backup/snapshot of current rules taken (if applicable)
- [ ] Rules deployed successfully
- [ ] Deployment verified in Firebase Console
- [ ] Application tested with new rules
- [ ] No permission errors in application
- [ ] All user roles tested
- [ ] Monitoring enabled

---

**Last Updated:** January 2026  
**Firebase Project:** bis-management-system-d77f4  
**Rules Version:** 1.0.0
