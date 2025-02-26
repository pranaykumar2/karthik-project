document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('fileInfo');
    const filesTableBody = document.getElementById('filesTableBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const toast = document.getElementById('toast');

    // Initialize animations
    animateContent();

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('highlight');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('highlight');
        });
    });

    dropZone.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFileSelect(file);
    }

    // File input change handler
    document.querySelector('input[type="file"]').addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    function handleFileSelect(file) {
        if (file) {
            const size = formatFileSize(file.size);
            fileInfo.innerHTML = `
                <div class="file-info-card">
                    <i class="bi bi-file-earmark"></i>
                    <p class="file-name">${file.name}</p>
                    <p class="file-size">${size}</p>
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                </div>
            `;
            fileInfo.style.display = 'block';
        }
    }

    // Form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            showLoading(true);
            const formData = new FormData(uploadForm);

            // Add current user and timestamp
            formData.append('uploadedBy', 'pranaykumar2');
            formData.append('uploadTimestamp', '2025-02-26 14:30:22');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showToast('File uploaded successfully!', 'success');
                uploadForm.reset();
                fileInfo.style.display = 'none';
                loadFiles();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            showLoading(false);
        }
    });

    // Load and display files
    async function loadFiles() {
        try {
            const response = await fetch('/api/files');
            const data = await response.json();

            if (data.success) {
                renderFilesList(data.files);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showToast('Error loading files', 'error');
        }
    }

    function renderFilesList(files) {
        filesTableBody.innerHTML = '';

        files.forEach(file => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="file-cell">
                        <i class="bi bi-file-earmark-text"></i>
                        <span class="file-name">${file.fileName}</span>
                    </div>
                </td>
                <td>
                    <div class="description-cell">
                        <p class="truncate">${file.description}</p>
                    </div>
                </td>
                <td>${file.culpritName}</td>
                <td>${formatDate(file.uploadedAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="window.open('https://gateway.pinata.cloud/ipfs/${file.ipfsCid}', '_blank')">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button class="action-btn copy-btn" onclick="copyToClipboard('${file.ipfsCid}')">
                            <i class="bi bi-clipboard"></i> CID
                        </button>
                        <button class="action-btn info-btn" onclick="showMetadata('${file.ipfsCid}')">
                            <i class="bi bi-info-circle"></i>
                        </button>
                    </div>
                </td>
            `;

            // Add animation to row
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            filesTableBody.appendChild(row);

            // Trigger animation
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    // Utility functions
    function showLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
        Array.from(document.querySelectorAll('button[type="submit"]')).forEach(button => {
            button.disabled = show;
        });
    }

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    window.copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast('CID copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy CID', 'error');
        }
    };

    window.showMetadata = async (ipfsCid) => {
        try {
            const response = await fetch(`/api/metadata/${ipfsCid}`);
            const data = await response.json();

            if (data.success) {
                const metadataDialog = document.createElement('dialog');
                metadataDialog.className = 'metadata-dialog';
                metadataDialog.innerHTML = `
                    <div class="metadata-content">
                        <h3>File Metadata</h3>
                        <pre>${JSON.stringify(data.metadata, null, 2)}</pre>
                        <button onclick="this.closest('dialog').close()">Close</button>
                    </div>
                `;
                document.body.appendChild(metadataDialog);
                metadataDialog.showModal();
            }
        } catch (error) {
            showToast('Error loading metadata', 'error');
        }
    };

    function animateContent() {
        const elements = document.querySelectorAll('.form-group, .inventory-section');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
    }

    // Initial load
    loadFiles();
});