import { LightningElement, api, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import quillJS from '@salesforce/resourceUrl/quillJS';
import quillCSS from '@salesforce/resourceUrl/quillCSS';

export default class RichTextEditor extends LightningElement {
    static renderMode = 'light';
    quillInitialized = false;
    quill;
    @track uploadedFiles = []; // PDFs adicionados

    @api toOptions = [];
    @api ccOptions = [];
    @api bccOptions = [];
    @api subject = '';
    @api fromOptions = [];

    _preselectedTo = [];
    _preselectedCc = [];
    _preselectedBcc = [];

    // PRESELECTED
    @api
    get preselectedTo() {
        return this._preselectedTo;
    }
    set preselectedTo(value) {
        this._preselectedTo = value || [];
    }

    @api
    get preselectedCc() {
        return this._preselectedCc;
    }
    set preselectedCc(value) {
        this._preselectedCc = value || [];
    }

    @api
    get preselectedBcc() {
        return this._preselectedBcc;
    }
    set preselectedBcc(value) {
        this._preselectedBcc = value || [];
    }

    @track selectedTo = [];
    @track selectedCc = [];
    @track selectedBcc = [];

    get fromValue() {
        return this.fromOptions[0].value;
    }

    renderedCallback() {
        if (this.quillInitialized) return;
        this.quillInitialized = true;

        Promise.all([
            loadScript(this, quillJS),
            loadStyle(this, quillCSS)
        ])
            .then(() => {
                const editorContainer = this.querySelector('.editor');

                // Toolbar completa do Quill
                const toolbarOptions = [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'script': 'sub' }, { 'script': 'super' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video', 'formula'],
                    ['clean'],
                ];

                // 🟢 Inicializa o Quill
                this.quill = new Quill(editorContainer, {
                    theme: 'snow',
                    modules: {
                        toolbar: toolbarOptions,
                        history: {
                            delay: 1000,
                            maxStack: 100,
                            userOnly: true
                        }
                    },
                    placeholder: '',
                    scrollingContainer: null
                });

                // 🔍 Listener oficial do Quill
                this.quill.on('selection-change', (range) => {
                    if (range && range.length > 0) {
                        const selectedText = this.quill.getText(range.index, range.length);
                    }
                });

                // 🧠 Listeners adicionais para garantir captura de seleção via mouse
                const editorEl = this.quill.root;

                const logSelection = () => {
                    const range = this.quill.getSelection();
                    if (range && range.length > 0) {
                        const text = this.quill.getText(range.index, range.length);
                    }
                };

                // Mouse selection (funciona mesmo quando o Quill não dispara o evento nativo)
                editorEl.addEventListener('mouseup', () => {
                    setTimeout(logSelection, 0); // pequeno delay pra garantir range atualizado
                });

                // Teclado (setas, shift, ctrl + A, etc)
                editorEl.addEventListener('keyup', () => {
                    setTimeout(logSelection, 0);
                });

                // Quando o mouse sai do editor após seleção
                editorEl.addEventListener('mouseleave', () => {
                    setTimeout(logSelection, 0);
                });

                // 🧩 Adiciona botões customizados
                const toolbar = this.quill.getModule('toolbar');

                // Undo
                const undoButton = document.createElement('button');
                undoButton.type = 'button';
                undoButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12h18"></path>
                <path d="M3 12l6-6"></path>
                <path d="M3 12l6 6"></path>
            </svg>`;
                undoButton.title = 'Undo';
                undoButton.onclick = () => this.quill.history.undo();
                toolbar.container.appendChild(undoButton);

                // Redo
                const redoButton = document.createElement('button');
                redoButton.type = 'button';
                redoButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12H3"></path>
                <path d="M21 12l-6-6"></path>
                <path d="M21 12l-6 6"></path>
            </svg>`;
                redoButton.title = 'Redo';
                redoButton.onclick = () => this.quill.history.redo();
                toolbar.container.appendChild(redoButton);

                // PDF button
                const pdfButton = document.createElement('button');
                pdfButton.type = 'button';
                pdfButton.title = 'Inserir PDF';
                pdfButton.innerHTML = 'PDF';
                pdfButton.onclick = () => this.handlePDFUpload();
                toolbar.container.appendChild(pdfButton);
            })
            .catch(error => {
                console.error('Erro ao carregar Quill', error);
            });
    }

    // Métodos públicos
    @api
    getContent() {
        return this.quill ? this.quill.root.innerHTML : '';
    }

    @api
    setContent(html) {
        if (this.quill) {
            this.quill.clipboard.dangerouslyPasteHTML(html);
        }
    }

    @api
    clearContent() {
        if (this.quill) this.quill.root.innerHTML = '';
    }

    handlePDFUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = e => this.processPDF(e);
        input.click();
    }

    processPDF(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            const pdfObj = {
                fileName: file.name,
                base64: base64,
                contentType: file.type
            };
            this.uploadedFiles = [...this.uploadedFiles, pdfObj]; // reativo
        };
        reader.readAsDataURL(file);
    }

    removePDF(event) {
        const fileName = event.target.dataset.filename;
        this.uploadedFiles = this.uploadedFiles.filter(f => f.fileName !== fileName);
    }

    @api
    getAttachments() {
        return this.uploadedFiles;
    }

    handleAttachFiles() {
        this.handlePDFUpload();
    }

    handleSelectTemplate() {
        this.dispatchEvent(new CustomEvent('selecttemplate'));
    }

    handleSend() {
        const payload = {
            from: this.fromValue,                 // pega o primeiro valor do fromOptions
            to: this.selectedTo,                  // array de objetos {label, value}
            cc: this.selectedCc,                  // array de objetos {label, value}
            bcc: this.selectedBcc,                // array de objetos {label, value}
            subject: this.subject,                // subject vindo do @api
            content: this.getContent(),           // html do quill
            attachments: this.getAttachments()    // pdfs
        };

        this.dispatchEvent(new CustomEvent('sendemail', {
            detail: payload,
            bubbles: true,
            composed: true
        }));
    }

    handleBack() {
        window.history.back();
    }

    handleBccChange(event) {
        this.selectedBcc = event.detail;
    }

    handleToChange(event) {
        this.selectedTo = event.detail;
    }

    handleCcChange(event) {
        this.selectedCc = event.detail;
    }
}