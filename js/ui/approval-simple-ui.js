/**
 * Interface simplificada para o padrão Chain of Responsibility
 * Gerencia o painel de aprovação de tarefas
 */
class ApprovalSimpleUI {
    constructor() {
        // Referência ao controlador principal
        this.uiController = null;
    }
    
    /**
     * Define a referência para o controlador de UI principal
     * @param {UIController} controller 
     */
    setUIController(controller) {
        this.uiController = controller;
    }
    
    /**
     * Inicializa os manipuladores de eventos e a interface
     */
    init() {
        console.log('ApprovalUI: Inicializando interface de aprovação');
        
        // Adicionar manipulador de eventos para botões de aprovação
        document.getElementById('approval-tasks-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('approve-btn')) {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.approveTask(taskId);
            }
        });
    }
    
    /**
     * Tenta aprovar uma tarefa usando a cadeia de responsabilidade
     * @param {number} taskId - ID da tarefa a ser aprovada
     */
    approveTask(taskId) {
        // Verificar se a tarefa existe
        const task = this.uiController.findTaskById(taskId);
        if (!task) {
            console.error(`ApprovalUI: Tarefa ${taskId} não encontrada`);
            return;
        }
        
        // Obter o nível de acesso atual (convertendo de AccessLevels para string simples)
        const currentLevel = accessManager.getAccessLevel().toLowerCase();
        
        // Iniciar o processo de aprovação
        const result = approvalChain.approve(taskId, currentLevel);
        
        if (result) {
            console.log(`ApprovalUI: Aprovação bem-sucedida para tarefa ${taskId}`);
            
            // Se for a aprovação final, atualizar o status da tarefa
            if (taskApprovals.isFullyApproved(taskId)) {
                task.setStatus('aprovada');
            }
            
            // Mostrar feedback para o usuário
            const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById('notification-toast'));
            document.querySelector('#notification-toast .toast-body').textContent = 
                `Tarefa "${task.getTitle()}" aprovada com sucesso!`;
            toast.show();
            
            // Atualizar a interface
            this.renderApprovalTasks();
            this.uiController.renderTasks();
        } else {
            console.log(`ApprovalUI: Falha na aprovação da tarefa ${taskId}`);
            
            // Mostrar mensagem de erro
            const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById('access-toast'));
            document.querySelector('#access-toast .toast-body').textContent = 
                `Você não tem permissão para aprovar esta tarefa neste momento.`;
            toast.show();
        }
    }
    
    /**
     * Renderiza o painel de tarefas em aprovação
     */
    renderApprovalTasks() {
        const container = document.getElementById('approval-tasks-container');
        
        // Filtrar tarefas concluídas para o painel de aprovação
        const completedTasks = this.uiController.tasks.filter(task => 
            task.getStatus() === 'concluida' || task.getStatus() === 'aprovada');
        
        if (completedTasks.length === 0) {
            container.innerHTML = `
                <div class="list-group-item text-center text-muted">
                    Nenhuma tarefa em processo de aprovação
                </div>
            `;
            return;
        }
        
        // Limpar o container
        container.innerHTML = '';
        
        // Renderizar cada tarefa
        completedTasks.forEach(task => {
            const taskId = task.getId();
            const steps = taskApprovals.getApprovalSteps(taskId);
            const viewerApproved = steps.includes('viewer');
            const editorApproved = steps.includes('editor');
            const adminApproved = steps.includes('admin');
            const fullyApproved = adminApproved;
            
            // Determinar o próximo nível de aprovação necessário
            let nextLevel = '';
            if (!viewerApproved) nextLevel = 'viewer';
            else if (!editorApproved) nextLevel = 'editor';
            else if (!adminApproved) nextLevel = 'admin';
            
            // Badges para os níveis de aprovação
            const viewerBadge = viewerApproved 
                ? '<span class="badge bg-success me-1">Viewer ✓</span>' 
                : '<span class="badge bg-secondary me-1">Viewer</span>';
                
            const editorBadge = editorApproved 
                ? '<span class="badge bg-success me-1">Editor ✓</span>' 
                : '<span class="badge bg-secondary me-1">Editor</span>';
                
            const adminBadge = adminApproved 
                ? '<span class="badge bg-success me-1">Admin ✓</span>' 
                : '<span class="badge bg-secondary me-1">Admin</span>';
            
            // Botão de aprovação baseado no nível atual do usuário
            const currentLevel = accessManager.getAccessLevel().toLowerCase();
            let approveButton = '';
            
            if (fullyApproved) {
                approveButton = '<span class="badge bg-success">Totalmente Aprovada</span>';
            } else if (nextLevel && this.canUserApproveLevel(currentLevel, nextLevel)) {
                approveButton = `<button class="btn btn-sm btn-primary approve-btn" data-task-id="${taskId}">Aprovar</button>`;
            } else {
                approveButton = '<span class="badge bg-warning">Aguardando aprovação</span>';
            }
            
            // Classes para estilização
            let itemClasses = "list-group-item task-approval-item";
            if (viewerApproved) itemClasses += " approved-viewer";
            if (editorApproved) itemClasses += " approved-editor";
            if (adminApproved) itemClasses += " approved-admin";
            if (fullyApproved) itemClasses += " fully-approved";
            
            // Gerar HTML da tarefa
            container.innerHTML += `
                <div class="${itemClasses}" id="approval-task-${taskId}">
                    <h5 class="mb-1">${task.getTitle()}</h5>
                    <p class="mb-1">${task.getDescription()}</p>
                    <div class="mb-2">
                        <small>Tipo: ${task.getType()}</small> | 
                        <small>Status: <span class="badge ${fullyApproved ? 'bg-success' : 'bg-warning'}">${task.getStatus()}</span></small>
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
        });
    }
    
    /**
     * Verifica se um usuário pode aprovar um determinado nível
     * @param {string} userLevel - Nível do usuário
     * @param {string} approvalLevel - Nível de aprovação necessário
     * @returns {boolean}
     */
    canUserApproveLevel(userLevel, approvalLevel) {
        if (approvalLevel === 'viewer') {
            return userLevel === 'viewer' || userLevel === 'editor' || userLevel === 'admin';
        }
        if (approvalLevel === 'editor') {
            return userLevel === 'editor' || userLevel === 'admin';
        }
        if (approvalLevel === 'admin') {
            return userLevel === 'admin';
        }
        return false;
    }
} 