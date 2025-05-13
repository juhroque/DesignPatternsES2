/**
 * Classe para gerenciar a interface de controle de acesso
 */
class AccessUI {
    constructor() {
        // Elementos da interface
        this.accessSelector = document.getElementById('access-level-selector');
        
        // Referência ao controlador UI
        this.uiController = null;
        
        // Inicializar eventos
        this.initEvents();
    }
    
    /**
     * Define o controlador de UI
     * @param {UIController} controller - O controlador de UI
     */
    setUIController(controller) {
        this.uiController = controller;
    }
    
    /**
     * Inicializa os eventos dos elementos da interface
     */
    initEvents() {
        if (this.accessSelector) {
            this.accessSelector.addEventListener('change', (e) => {
                // Atualizar o nível de acesso
                accessManager.setAccessLevel(e.target.value);
                
                // Atualizar a interface com base no novo nível
                this.updateUIBasedOnAccess();
                
                // Mostrar feedback ao usuário
                this.showAccessChangeFeedback(e.target.value);
            });
        }
    }
    
    /**
     * Mostra feedback sobre a mudança de nível de acesso
     * @param {string} level - O novo nível de acesso
     */
    showAccessChangeFeedback(level) {
        let message = '';
        let badgeClass = '';
        
        switch (level) {
            case AccessLevels.VIEWER:
                message = 'Modo visualização ativado. Você só pode visualizar tarefas.';
                badgeClass = 'bg-info';
                break;
            case AccessLevels.EDITOR:
                message = 'Modo editor ativado. Você pode criar e editar tarefas, mas não excluí-las.';
                badgeClass = 'bg-success';
                break;
            case AccessLevels.ADMIN:
                message = 'Modo administrador ativado. Você tem acesso completo.';
                badgeClass = 'bg-danger';
                break;
        }
        
        // Atualizar o badge do nível de acesso
        const badge = document.getElementById('access-level-badge');
        if (badge) {
            badge.className = `badge ${badgeClass}`;
            badge.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        }
        
        // Mostrar toast ou alerta
        this.showToast(message);
    }
    
    /**
     * Exibe um toast com uma mensagem
     * @param {string} message - A mensagem a ser exibida 
     */
    showToast(message) {
        const toastEl = document.getElementById('access-toast');
        if (toastEl) {
            const toastBody = toastEl.querySelector('.toast-body');
            if (toastBody) {
                toastBody.textContent = message;
                
                // Usando Bootstrap para mostrar o toast
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            }
        } else {
            // Fallback para alert se o toast não estiver disponível
            alert(message);
        }
    }
    
    /**
     * Atualiza a UI com base no nível de acesso atual
     */
    updateUIBasedOnAccess() {
        const level = accessManager.getAccessLevel();
        
        // Obter todos os botões de ações
        const createTaskBtn = document.querySelector('#task-form button[type="submit"]');
        const statusBtns = document.querySelectorAll('.status-btn');
        const deleteBtns = document.querySelectorAll('.delete-btn');
        const decorateBtn = document.getElementById('apply-decorators');
        
        // Atualizar botão de criar tarefa
        if (createTaskBtn) {
            createTaskBtn.disabled = !accessManager.hasPermission('edit');
        }
        
        // Atualizar botões de status
        statusBtns.forEach(btn => {
            btn.disabled = !accessManager.hasPermission('edit');
        });
        
        // Atualizar botões de excluir
        deleteBtns.forEach(btn => {
            btn.disabled = !accessManager.hasPermission('delete');
        });
        
        // Atualizar botão de decorar
        if (decorateBtn) {
            decorateBtn.disabled = !accessManager.hasPermission('edit');
        }
        
        // Informar ao UIController para atualizar a renderização com base nas permissões
        if (this.uiController) {
            this.uiController.updateUIForAccessLevel(level);
        }
    }
    
    /**
     * Inicializa a interface de controle de acesso
     */
    init() {
        // Definir o valor inicial do seletor
        if (this.accessSelector) {
            this.accessSelector.value = accessManager.getAccessLevel();
        }
        
        // Atualizar a interface com base no nível inicial
        this.updateUIBasedOnAccess();
    }
} 