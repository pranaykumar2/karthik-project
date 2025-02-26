class MetadataViewer {
    constructor() {
        this.initializeViewer();
    }

    initializeViewer() {
        // Create metadata viewer modal
        const viewerHTML = `
            <div id="metadataModal" class="metadata-modal">
                <div class="metadata-content">
                    <div class="metadata-header">
                        <h2>File Metadata</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="metadata-body">
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="basic">Basic Info</button>
                            <button class="tab-btn" data-tab="technical">Technical Details</button>
                            <button class="tab-btn" data-tab="ipfs">IPFS Info</button>
                        </div>
                        <div class="tab-content">
                            <div id="basicTab" class="tab-pane active"></div>
                            <div id="technicalTab" class="tab-pane"></div>
                            <div id="ipfsTab" class="tab-pane"></div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', viewerHTML);
        this.bindEvents();
    }

    bindEvents() {
        const modal = document.getElementById('metadataModal');
        const closeBtn = modal.querySelector('.close-btn');
        const tabBtns = modal.querySelectorAll('.tab-btn');

        closeBtn.addEventListener('click', () => this.hide());

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hide();
        });
    }

    async showMetadata(ipfsCid) {
        try {
            const response = await fetch(`/api/metadata/${ipfsCid}`);
            const data = await response.json();

            if (data.success) {
                this.displayMetadata(data.metadata, ipfsCid);
                document.getElementById('metadataModal').classList.add('show');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showToast('Error loading metadata', 'error');
        }
    }

    displayMetadata(metadata, ipfsCid) {
        // Basic Info Tab
        const basicHTML = this.formatBasicInfo(metadata);
        document.getElementById('basicTab').innerHTML = basicHTML;

        // Technical Details Tab
        const technicalHTML = this.formatTechnicalInfo(metadata);
        document.getElementById('technicalTab').innerHTML = technicalHTML;

        // IPFS Info Tab
        const ipfsHTML = this.formatIpfsInfo(ipfsCid, metadata);
        document.getElementById('ipfsTab').innerHTML = ipfsHTML;
    }

    formatBasicInfo(metadata) {
        return `
            <div class="info-section">
                <div class="info-card">
                    <h3>File Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>File Name:</label>
                            <span>${metadata.fileName || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Size:</label>
                            <span>${this.formatFileSize(metadata.fileSize)}</span>
                        </div>
                        <div class="info-item">
                            <label>Type:</label>
                            <span>${metadata.mimeType || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Uploaded By:</label>
                            <span>${metadata.uploadedBy || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Upload Date:</label>
                            <span>${this.formatDate(metadata.uploadedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    formatTechnicalInfo(metadata) {
        const technicalData = metadata.technical || {};
        return `
            <div class="info-section">
                <div class="technical-grid">
                    ${Object.entries(technicalData)
            .map(([key, value]) => `
                            <div class="technical-item">
                                <label>${this.formatLabel(key)}:</label>
                                <span>${this.formatValue(value)}</span>
                            </div>
                        `).join('')}
                </div>
            </div>`;
    }

    formatIpfsInfo(ipfsCid, metadata) {
        return `
            <div class="info-section">
                <div class="ipfs-info">
                    <div class="ipfs-card">
                        <h3>IPFS Details</h3>
                        <div class="cid-section">
                            <label>Content Identifier (CID):</label>
                            <div class="cid-display">
                                <code>${ipfsCid}</code>
                                <button class="copy-btn" onclick="copyToClipboard('${ipfsCid}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </div>
                        </div>
                        <div class="ipfs-links">
                            <a href="https://gateway.pinata.cloud/ipfs/${ipfsCid}" target="_blank" class="ipfs-btn">
                                <i class="bi bi-eye"></i> View on Pinata Gateway
                            </a>
                            <a href="ipfs://${ipfsCid}" class="ipfs-btn">
                                <i class="bi bi-link-45deg"></i> IPFS Protocol Link
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    hide() {
        document.getElementById('metadataModal').classList.remove('show');
    }

    switchTab(tabId) {
        const tabs = document.querySelectorAll('.tab-btn');
        const panes = document.querySelectorAll('.tab-pane');

        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });

        panes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabId}Tab`) {
                pane.classList.add('active');
            }
        });
    }

    formatFileSize(bytes) {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    formatLabel(key) {
        return key.split(/(?=[A-Z])/).join(' ');
    }

    formatValue(value) {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return value.toString();
    }
}