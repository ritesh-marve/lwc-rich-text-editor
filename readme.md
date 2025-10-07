# Rich Text Editor LWC

A complete Lightning Web Component (LWC) rich text editor based on the QuillJS library, fully ready to use in any Salesforce org. Recommended for creating and editing emails with all formatting options enabled.

---

## Overview

The `richTextEditor` component is a robust WYSIWYG editor featuring the "snow" theme from QuillJS with a full toolbar. It supports comprehensive text formatting including links, images, videos, formulas, lists, quotes, and more. It also allows uploading and managing PDF file attachments encoded in base64. This component is ideal for scenarios requiring rich email creation and editing within Salesforce.

---

## Key Features

- Full QuillJS editor with "snow" theme and complete toolbar.
- Toolbar options include:
  - Bold, italic, underline, strike-through.
  - Blockquote, code block.
  - Multiple header sizes and text sizes.
  - Ordered and bullet lists.
  - Subscript and superscript.
  - Indentation, right-to-left text direction.
  - Font color, background color, and font family.
  - Text alignment.
  - Insertion of links, images, videos, and formulas.
- Additional custom toolbar buttons:
  - Undo and redo support integrated with Quill's history module.
  - PDF upload button to attach PDF files to the editor.
- Reactive management of uploaded PDFs stored as base64 strings.
- Public methods to get, set, and clear editor content programmatically.
- Events to handle email sending with full payload data including attachments.
- Preselected recipients support for To, Cc, and Bcc fields.

---

## Public API

### Properties & Methods

- `@api getContent() : string`  
  Returns the current HTML content of the editor.

- `@api setContent(html: string) : void`  
  Sets the editor content with the provided HTML, replacing existing content.

- `@api clearContent() : void`  
  Clears all content from the editor.

- `@api preselectedTo, preselectedCc, preselectedBcc`  
  Arrays to preselect recipients for To, Cc, and Bcc address fields.

- `@api getAttachments() : Object[]`  
  Returns an array of uploaded PDF files as objects containing `fileName`, `base64`, and `contentType`.

---

## Custom Events Fired

- `sendemail`  
  Fired when the user triggers sending the email. The `event.detail` contains the payload:

  ```
  {
    from: string,         // Selected sender (first value in fromOptions)
    to: Array,            // Array of { label, value } objects for To recipients
    cc: Array,            // Array of { label, value } objects for Cc recipients
    bcc: Array,           // Array of { label, value } objects for Bcc recipients
    subject: string,      // Email subject
    content: string,      // Editor HTML content
    attachments: Array    // Uploaded PDF attachments
  }
  ```

- `selecttemplate`  
  Fired when the user requests to select a template for external handling.

---

## Usage and Integration

1. Add the static resources `quillJS` and `quillCSS` to your Salesforce org (QuillJS library and Snow theme CSS).
2. Import and use the component in any LWC or Aura component.
3. Configure public properties to supply email fields (from, to, cc, bcc) and subject.
4. Listen to `sendemail` and `selecttemplate` events for integration with sending logic or template selection.
5. Use public methods to programmatically manipulate editor content.

---

## Technologies

- Salesforce Lightning Web Components (LWC)
- QuillJS rich text editing library
- Static resources for scripts and styles
- FileReader for PDF file reading and base64 encoding

---

## Toolbar Customization

In addition to QuillJS’s full default toolbar, the component includes:

- Undo and redo buttons integrated with history.
- A PDF upload button that opens a file selector to add PDF attachments.

---

## Important Internal Methods

- `handlePDFUpload()`: Opens file selector to attach PDFs.
- `processPDF(event)`: Processes and stores selected PDFs as base64-encoded objects.
- `removePDF(event)`: Removes a PDF attachment from the list.
- `handleSend()`: Builds the email payload and dispatches the `sendemail` event.
- Handlers for To, Cc, and Bcc changes update the selected recipient lists.

---

## Example Template Usage

```
<c-rich-text-editor
    from-options={fromOptions}
    to-options={toOptions}
    cc-options={ccOptions}
    bcc-options={bccOptions}
    subject={subject}
    preselected-to={preselectedTo}
    preselected-cc={preselectedCc}
    preselected-bcc={preselectedBcc}
    onsendemail={handleSendEmail}
    onselecttemplatete={handleSelectTemplate}>
</c-rich-text-editor>
```

---

This component simplifies rich email creation and editing with PDF attachment support in any Salesforce org, providing a complete editing experience.

---

## Author

Component developed for corporate Salesforce usage by Guilherme Avila.

---

## License

MIT License.
```