# Frequently Asked Questions (FAQ)

## Authentication & Login

### Why do we use `.local` domain for user emails?

The BIS-SMS system uses the `.local` domain (e.g., `admin@bis.local`, `teacher1@bis.local`) for Firebase Authentication email addresses for several important reasons:

#### 1. **Internal System Identification**
The `.local` domain is a standard convention for internal, non-internet-routable domains. This clearly indicates that these are system accounts for the school management system, not real external email addresses.

#### 2. **Separation from Real Email Addresses**
Using `.local` prevents conflicts with actual email addresses that users might have:
- A teacher named John Smith might have a personal email `john.smith@gmail.com`
- But in the system, they're identified as `teacher5@bis.local`
- This separation ensures system authentication is independent of personal email addresses

#### 3. **Consistent and Predictable Format**
The `.local` domain allows for a standardized email pattern:
- **Administrators**: `admin@bis.local`
- **Teachers**: `teacher{ID}@bis.local` (e.g., `teacher1@bis.local`)
- **Students**: `student{ID}@bis.local` (e.g., `student1@bis.local`)
- **Parents**: `parent.{childID}@bis.local` (e.g., `parent.c331@bis.local`)

This consistency makes user management and role identification straightforward.

#### 4. **Firebase Authentication Compatibility**
Firebase Authentication accepts email-format identifiers even if they're not real email addresses. The `.local` domain:
- Works perfectly with Firebase Auth's email/password authentication
- Doesn't require actual email verification (suitable for a closed school system)
- Allows the system to function without SMTP server configuration

#### 5. **Security and Privacy**
- Users don't need to share their personal email addresses with the system
- No external email services are involved in the authentication process
- Reduces privacy concerns for students and staff

#### 6. **School-Specific Namespace**
The `.bis.local` specifically ties these accounts to Bophelong Independent School, making it clear these are institution-specific credentials.

#### 7. **No External Dependencies**
The system doesn't rely on:
- External email providers (Gmail, Outlook, etc.)
- Email verification processes
- SMTP servers for sending verification emails

This makes the system simpler to deploy and maintain for a school environment.

### Can users change their email to a real one?

While technically possible in Firebase, the current system is designed to work with the `.local` domain format. Changing to real email addresses would require:
1. Updating the authentication logic in the code
2. Implementing email verification workflows
3. Configuring SMTP settings for Firebase
4. Updating all role-detection logic that relies on the `.local` pattern

### What if two schools use the same system?

Each school would typically:
1. Deploy their own Firebase project
2. Use their own `.local` domain pattern (e.g., `school1.local`, `school2.local`)
3. Maintain separate user databases

Alternatively, different subdomains could be used (e.g., `admin@school1.local`, `admin@school2.local`).

### Is `.local` a real internet domain?

No, `.local` is reserved by the Internet Engineering Task Force (IETF) for link-local communications and multicast DNS. It's specifically designed NOT to be routable on the public internet, making it perfect for internal systems like this school management application.

---

## Technical Details

### How does the system identify user roles?

The system uses the email pattern to automatically determine user roles:
- Email starting with `admin@bis.local` → Administrator role
- Email pattern `teacher{number}@bis.local` → Teacher role (extracts teacher ID)
- Email pattern `student{number}@bis.local` → Student role (extracts student ID)
- Email pattern `parent.{id}@bis.local` → Parent role (extracts child ID)

This automatic role detection happens in the login flow and is validated against Firebase Authentication.

### Can I use real email addresses instead?

Yes, but it would require significant code modifications:
1. Update all email generation logic in `index.html` and `admin.html`
2. Modify role detection logic to use Firebase custom claims or Firestore user documents
3. Implement email verification workflows
4. Update all documentation

The `.local` approach is simpler and more suitable for a closed school system.

---

## Related Documentation

- [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md) - Complete list of login credentials
- [USER_MANAGEMENT_GUIDE.md](USER_MANAGEMENT_GUIDE.md) - How to create and manage users
- [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md) - Firebase setup details
- [CLOUD_STORAGE_FIX_SUMMARY.md](CLOUD_STORAGE_FIX_SUMMARY.md) - Cloud storage implementation

---

## Support

For more questions, please refer to the documentation files in the repository or contact the system administrator.
