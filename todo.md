# This document explains improvements for the project.

## USERS

### **Sing up**

When signing up, the system checks if the user already exists in the database by email and the delete field.

- If the email does not exist, everything is OK.
  -If the user exists but has a soft delete (delete = true), the project could return a message like:
  "Would you like to restore your account?"

## TOKEN

## Delete expired tokens

When a JSON Web Token is created, it is also saved in the Token table.
The JWT expires in one hour, but if the user does not log out, the token record in the database is never deleted, even though it has already expired.
