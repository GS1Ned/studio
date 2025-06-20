# Plan to Update Firebase CLI

**Goal:** Update the Firebase CLI to the latest version on macOS using Homebrew.

**Steps:**

1.  **Check Current Firebase CLI Version:**
    *   Execute `firebase --version` to determine the currently installed version of the Firebase CLI. This will help confirm the upgrade was successful later.
2.  **Identify Firebase Binary Path:**
    *   Execute `which firebase` to identify the exact path of the `firebase` binary being used. This is a troubleshooting tip provided in the instructions and can be useful if version conflicts arise.
3.  **Upgrade Firebase CLI:**
    *   Execute the Homebrew upgrade command: `brew upgrade firebase-cli`. This will fetch and install the latest version of the Firebase CLI.
4.  **Verify Updated Firebase CLI Version:**
    *   After the upgrade command completes, execute `firebase --version` again to confirm that the Firebase CLI has been updated to the latest version.
5.  **User Action: Restart Terminal:**
    *   Advise the user to restart their terminal session. This is crucial to ensure that the shell picks up the new version of the `firebase` binary and avoids pointing to the old one.

**Mermaid Diagram:**

```mermaid
graph TD
    A[Start: User wants to update Firebase CLI] --> B{Firebase CLI installed via Homebrew?};
    B -- Yes --> C[Check Current Firebase CLI Version];
    C --> D[Identify Firebase Binary Path];
    D --> E[Upgrade Firebase CLI via Homebrew];
    E --> F[Verify Updated Firebase CLI Version];
    F --> G[Instruct User to Restart Terminal];
    G --> H[End: Firebase CLI Updated];