/**
 * Extensão do modelo de tarefa para suportar o padrão Chain of Responsibility
 * para o fluxo de aprovação de tarefas
 */

/**
 * Decorator para adicionar funcionalidades de aprovação às tarefas
 */
class ApprovalTaskDecorator {
    constructor(task) {
        this.task = task;
        this.approvalSteps = [];
        this.isApproved = false;
    }
    
    /**
     * Adiciona um nível de aprovação à tarefa
     * @param {string} level - Nível de acesso que aprovou (viewer, editor, admin)
     */
    addApprovalStep(level) {
        if (!this.approvalSteps.includes(level)) {
            this.approvalSteps.push(level);
            console.log(`Task: Adicionou aprovação de nível ${level} à tarefa ${this.task.getId()}`);
        }
    }
    
    /**
     * Verifica se a tarefa já foi aprovada por um determinado nível
     * @param {string} level - Nível de acesso a verificar
     * @returns {boolean} Verdadeiro se já foi aprovada por este nível
     */
    hasApprovalStep(level) {
        return this.approvalSteps.includes(level);
    }
    
    /**
     * Obtém todos os níveis de aprovação já realizados
     * @returns {Array} Lista de níveis que já aprovaram
     */
    getApprovalSteps() {
        return this.approvalSteps;
    }
    
    /**
     * Define se a tarefa está totalmente aprovada
     * @param {boolean} approved - Estado de aprovação
     */
    setApproved(approved) {
        this.isApproved = approved;
        if (approved) {
            // Definir como aprovada e atualizar o status do objeto decorado
            this.task.setStatus('aprovada');
        }
    }
    
    /**
     * Verifica se a tarefa está totalmente aprovada
     * @returns {boolean} Estado de aprovação
     */
    isTaskApproved() {
        return this.isApproved;
    }
    
    /**
     * Obtém a representação HTML para o painel de aprovação
     * @returns {string} HTML da tarefa no contexto de aprovação
     */
    getApprovalHtmlRepresentation() {
        // Verificar quais etapas já foram aprovadas
        const viewerApproved = this.hasApprovalStep('viewer');
        const editorApproved = this.hasApprovalStep('editor');
        const adminApproved = this.hasApprovalStep('admin');
        
        // Criar badges de aprovação
        const viewerBadge = viewerApproved 
            ? '<span class="badge bg-success me-1">Viewer ✓</span>' 
            : '<span class="badge bg-secondary me-1">Viewer</span>';
            
        const editorBadge = editorApproved 
            ? '<span class="badge bg-success me-1">Editor ✓</span>' 
            : '<span class="badge bg-secondary me-1">Editor</span>';
            
        const adminBadge = adminApproved 
            ? '<span class="badge bg-success me-1">Admin ✓</span>' 
            : '<span class="badge bg-secondary me-1">Admin</span>';
        
        // Obter o nível de acesso atual do usuário
        // Precisamos ter certeza que accessManager está disponível globalmente
        const currentAccessLevel = accessManager.getAccessLevel();
        console.log(`Nível de acesso atual ao renderizar: ${currentAccessLevel}`);
        
        // Determinar qual botão de aprovação mostrar com base no nível atual do usuário e da tarefa
        let approveButton = '';
        
        if (this.isApproved) {
            approveButton = '<span class="badge bg-success">Totalmente Aprovada</span>';
        } else if (!viewerApproved && (currentAccessLevel === AccessLevels.VIEWER || 
                   currentAccessLevel === AccessLevels.EDITOR || 
                   currentAccessLevel === AccessLevels.ADMIN)) {
            approveButton = `<button class="btn btn-sm btn-primary approve-btn" data-task-id="${this.task.getId()}" data-level="viewer">Aprovar como Viewer</button>`;
        } else if (viewerApproved && !editorApproved && 
                  (currentAccessLevel === AccessLevels.EDITOR || 
                   currentAccessLevel === AccessLevels.ADMIN)) {
            approveButton = `<button class="btn btn-sm btn-primary approve-btn" data-task-id="${this.task.getId()}" data-level="editor">Aprovar como Editor</button>`;
        } else if (viewerApproved && editorApproved && !adminApproved && 
                  currentAccessLevel === AccessLevels.ADMIN) {
            approveButton = `<button class="btn btn-sm btn-primary approve-btn" data-task-id="${this.task.getId()}" data-level="admin">Aprovar como Admin</button>`;
        } else {
            approveButton = '<span class="badge bg-warning">Aguardando aprovação</span>';
        }
        
        // Adicionar classe CSS com base nas aprovações
        let itemClasses = "list-group-item task-approval-item";
        if (viewerApproved) itemClasses += " approved-viewer";
        if (editorApproved) itemClasses += " approved-editor";
        if (adminApproved) itemClasses += " approved-admin";
        if (this.isApproved) itemClasses += " fully-approved";
        
        // Delegar para o objeto decorado para obter informações básicas
        return `
            <div class="${itemClasses}" id="approval-task-${this.task.getId()}">
                <h5 class="mb-1">${this.task.getTitle()}</h5>
                <p class="mb-1">${this.task.getDescription()}</p>
                <div class="mb-2">
                    <small>Tipo: ${this.task.getType()}</small> | 
                    <small>Status: <span class="badge ${this.isApproved ? 'bg-success' : 'bg-warning'}">${this.task.getStatus()}</span></small>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="approval-badges">
                        ${viewerBadge}
                        ${editorBadge}
                        ${adminBadge}
                    </div>
                    <div class="approval-actions">
                        ${approveButton}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Métodos delegados para o objeto Task decorado
    getId() {
        return this.task.getId();
    }
    
    getTitle() {
        return this.task.getTitle();
    }
    
    getDescription() {
        return this.task.getDescription();
    }
    
    getStatus() {
        return this.task.getStatus();
    }
    
    setStatus(status) {
        this.task.setStatus(status);
    }
    
    getType() {
        return this.task.getType();
    }
    
    getCreatedAt() {
        return this.task.getCreatedAt();
    }
    
    getHtmlRepresentation() {
        return this.task.getHtmlRepresentation();
    }
} 