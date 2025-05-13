/**
 * Classe para gerenciar a interface das configurações do usuário
 */
class ConfigUI {
    constructor() {
        // Elementos da interface
        this.configPanel = document.getElementById('config-panel');
        this.themeSelector = document.getElementById('theme-selector');
        this.sortingSelector = document.getElementById('task-sorting');
        this.showCompletedCheckbox = document.getElementById('show-completed');
        this.notificationOptions = {
            taskCreated: document.getElementById('notify-task-created'),
            taskCompleted: document.getElementById('notify-task-completed'),
            taskDecorated: document.getElementById('notify-task-decorated')
        };
        this.resetButton = document.getElementById('reset-config');
        
        // Referência ao UIController para atualizar a visualização
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
        // Tema
        if (this.themeSelector) {
            this.themeSelector.addEventListener('change', (e) => {
                configManager.set('theme', e.target.value);
                this.applyTheme(e.target.value);
            });
        }
        
        // Ordenação
        if (this.sortingSelector) {
            this.sortingSelector.addEventListener('change', (e) => {
                configManager.set('taskSorting', e.target.value);
                if (this.uiController) {
                    this.uiController.renderTasks();
                }
            });
        }
        
        // Mostrar tarefas concluídas
        if (this.showCompletedCheckbox) {
            this.showCompletedCheckbox.addEventListener('change', (e) => {
                configManager.set('showCompletedTasks', e.target.checked);
                if (this.uiController) {
                    this.uiController.renderTasks();
                }
            });
        }
        
        // Notificações
        if (this.notificationOptions.taskCreated) {
            this.notificationOptions.taskCreated.addEventListener('change', (e) => {
                configManager.set('notifications.showTaskCreated', e.target.checked);
            });
        }
        
        if (this.notificationOptions.taskCompleted) {
            this.notificationOptions.taskCompleted.addEventListener('change', (e) => {
                configManager.set('notifications.showTaskCompleted', e.target.checked);
            });
        }
        
        if (this.notificationOptions.taskDecorated) {
            this.notificationOptions.taskDecorated.addEventListener('change', (e) => {
                configManager.set('notifications.showTaskDecorated', e.target.checked);
            });
        }
        
        // Botão de reset
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                configManager.resetToDefaults();
                this.loadConfigValues();
                if (this.uiController) {
                    this.uiController.renderTasks();
                }
                this.applyTheme(configManager.get('theme'));
            });
        }
    }
    
    /**
     * Carrega os valores atuais das configurações para a interface
     */
    loadConfigValues() {
        // Tema
        if (this.themeSelector) {
            this.themeSelector.value = configManager.get('theme');
        }
        
        // Ordenação
        if (this.sortingSelector) {
            this.sortingSelector.value = configManager.get('taskSorting');
        }
        
        // Mostrar tarefas concluídas
        if (this.showCompletedCheckbox) {
            this.showCompletedCheckbox.checked = configManager.get('showCompletedTasks');
        }
        
        // Notificações
        if (this.notificationOptions.taskCreated) {
            this.notificationOptions.taskCreated.checked = configManager.get('notifications.showTaskCreated');
        }
        
        if (this.notificationOptions.taskCompleted) {
            this.notificationOptions.taskCompleted.checked = configManager.get('notifications.showTaskCompleted');
        }
        
        if (this.notificationOptions.taskDecorated) {
            this.notificationOptions.taskDecorated.checked = configManager.get('notifications.showTaskDecorated');
        }
    }
    
    /**
     * Aplica o tema selecionado
     * @param {string} theme - O tema a ser aplicado ('light' ou 'dark')
     */
    applyTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    }
    
    /**
     * Inicializa a interface com as configurações atuais
     */
    init() {
        this.loadConfigValues();
        this.applyTheme(configManager.get('theme'));
    }
} 