/**
 * Controlador da interface do usuário
 * Gerencia as interações entre os padrões e a interface
 */
class UIController {
    constructor() {
        this.tasks = [];
        this.taskFactory = new TaskFactory();
        this.taskSubject = new TaskSubject();
        this.notifications = [];
        
        // Criar o proxy de controle de acesso
        this.accessProxy = new AccessControlProxy(this.tasks);
        
        // Inicializar observadores
        this.initObservers();
        
        // Configurar manipuladores de eventos
        this.setupEventListeners();
    }
    
    // Inicializar os observadores com base nas configurações do usuário
    initObservers() {
        // Adicionar observadores iniciais com base nas caixas de seleção
        if (document.getElementById('screen-observer').checked) {
            this.taskSubject.addObserver(new ScreenObserver(this.addNotification.bind(this)));
        }
        
        if (document.getElementById('email-observer').checked) {
            this.taskSubject.addObserver(new EmailObserver(this.addNotification.bind(this)));
        }
        
        if (document.getElementById('log-observer').checked) {
            this.taskSubject.addObserver(new LogObserver(this.addNotification.bind(this)));
        }
    }
    
    // Configurar manipuladores de eventos para a interface do usuário
    setupEventListeners() {
        // Manipular envio do formulário de tarefa
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });
        
        // Manipular cliques nos botões de status de tarefa (usando delegação de eventos)
        document.getElementById('tasks-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                const status = e.target.getAttribute('data-status');
                this.updateTaskStatus(taskId, status);
            }
            if (e.target.classList.contains('delete-btn')) {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.deleteTask(taskId);
            }
        });
        
        // Manipular aplicação de decoradores
        document.getElementById('apply-decorators').addEventListener('click', () => {
            this.applyDecorators();
        });
        
        // Atualizar observadores quando as caixas de seleção forem alteradas
        document.getElementById('screen-observer').addEventListener('change', this.updateObservers.bind(this));
        document.getElementById('email-observer').addEventListener('change', this.updateObservers.bind(this));
        document.getElementById('log-observer').addEventListener('change', this.updateObservers.bind(this));
    }
    
    // Criar uma nova tarefa usando o Factory Method
    createTask() {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const taskType = document.getElementById('task-type').value;
        
        if (!title) {
            alert('Por favor, insira um título para a tarefa.');
            return;
        }
        
        // Usar o Factory Method para criar a tarefa
        const task = this.taskFactory.createTask(taskType, title, description);
        
        // Usar o proxy para adicionar a tarefa com verificação de permissão
        if (this.accessProxy.addTask(task)) {
            // Atualizar a interface
            this.renderTasks();
            
            // Notificar observadores sobre a criação de tarefa se configurado
            if (configManager.get('notifications.showTaskCreated')) {
                this.taskSubject.notifyObservers(task, 'created');
            }
            
            // Limpar o formulário
            document.getElementById('task-form').reset();
        } else {
            // Se o proxy negou permissão, mostrar mensagem
            alert('Você não tem permissão para criar tarefas com seu nível de acesso atual.');
        }
    }
    
    // Atualizar o status de uma tarefa e notificar os observadores
    updateTaskStatus(taskId, status) {
        // Usar o proxy para atualizar com verificação de permissão
        if (this.accessProxy.updateTaskStatus(taskId, status)) {
            const task = this.findTaskById(taskId);
            
            // Notificar observadores sobre a mudança de status
            this.taskSubject.notifyObservers(task, status);
            
            // Atualizar a interface
            this.renderTasks();
            
            // Se a tarefa foi concluída, atualizar o painel de aprovação
            if (status === 'concluida' && window.approvalUI) {
                window.approvalUI.renderApprovalTasks();
            }
        } else {
            // Se o proxy negou permissão, a interface já deve estar atualizada
            // pelas verificações em AccessUI
        }
    }
    
    // Excluir uma tarefa
    deleteTask(taskId) {
        // Usar o proxy para excluir com verificação de permissão
        if (this.accessProxy.deleteTask(taskId)) {
            // Atualizar a interface
            this.renderTasks();
        } else {
            // Se o proxy negou permissão, a interface já deve estar atualizada
            // pelas verificações em AccessUI
        }
    }
    
    // Aplicar decoradores à tarefa selecionada
    applyDecorators() {
        const selectElement = document.getElementById('decorate-task-select');
        const taskId = parseInt(selectElement.value);
        
        if (!taskId) {
            alert('Por favor, selecione uma tarefa para aplicar os decoradores.');
            return;
        }
        
        // Encontrar a tarefa pelo ID
        let task = this.findTaskById(taskId);
        if (!task) return;
        
        // Aplicar decorador de alta prioridade, se selecionado
        if (document.getElementById('high-priority').checked) {
            task = new HighPriorityDecorator(task);
        }
        
        // Aplicar decorador de etiqueta colorida, se selecionado
        if (document.getElementById('color-label').checked) {
            const color = document.getElementById('color-select').value;
            task = new ColorLabelDecorator(task, color);
        }
        
        // Aplicar decorador de data de vencimento, se selecionado
        if (document.getElementById('due-date').checked) {
            const dueDate = document.getElementById('due-date-input').value;
            if (dueDate) {
                task = new DueDateDecorator(task, dueDate);
            }
        }
        
        // Usar o proxy para decorar com verificação de permissão
        if (this.accessProxy.decorateTask(taskId, task)) {
            // Atualizar a interface
            this.renderTasks();
            
            // Notificar sobre decoração se configurado
            if (configManager.get('notifications.showTaskDecorated')) {
                this.taskSubject.notifyObservers(task, 'decorated');
            }
        } else {
            // Se o proxy negou permissão, mostrar mensagem
            alert('Você não tem permissão para decorar tarefas com seu nível de acesso atual.');
        }
    }
    
    // Atualizar os observadores com base nas caixas de seleção
    updateObservers() {
        // Limpar todos os observadores
        this.taskSubject = new TaskSubject();
        
        // Reconstruir a lista de observadores com base nas caixas de seleção
        this.initObservers();
    }
    
    // Adicionar uma notificação à lista
    addNotification(notification) {
        this.notifications.push(notification);
        this.renderNotifications();
    }
    
    /**
     * Atualiza a interface com base no nível de acesso
     * @param {string} accessLevel - O nível de acesso atual
     */
    updateUIForAccessLevel(accessLevel) {
        // Renderizar tarefas para atualizar a visualização
        this.renderTasks();
        
        // Aqui podemos adicionar lógica adicional específica para cada nível de acesso
        const formContainer = document.getElementById('task-form').closest('.card');
        const decoratorContainer = document.getElementById('apply-decorators').closest('.card');
        
        if (formContainer && decoratorContainer) {
            // No modo visualizador, podemos reduzir a opacidade dos painéis de criação/decoração
            const isViewerMode = accessLevel === AccessLevels.VIEWER;
            formContainer.style.opacity = isViewerMode ? '0.6' : '1';
            decoratorContainer.style.opacity = isViewerMode ? '0.6' : '1';
        }
    }
    
    // Renderizar a lista de tarefas na interface do usuário
    renderTasks() {
        const container = document.getElementById('tasks-container');
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="list-group-item text-center text-muted">
                    Nenhuma tarefa criada ainda
                </div>
            `;
            document.getElementById('decorate-task-select').innerHTML = `
                <option value="">Selecione uma tarefa...</option>
            `;
            return;
        }
        
        container.innerHTML = '';
        let selectOptions = '<option value="">Selecione uma tarefa...</option>';
        
        // Filtrar e ordenar tarefas com base nas configurações
        let filteredTasks = [...this.tasks];
        
        // Ordenar as tarefas conforme configuração
        const sortingMethod = configManager.get('taskSorting');
        if (sortingMethod === 'priority') {
            // Ordenar por prioridade (tarefas de alta prioridade primeiro)
            filteredTasks.sort((a, b) => {
                const aHasPriority = a.getHtmlRepresentation().includes('high-priority-task');
                const bHasPriority = b.getHtmlRepresentation().includes('high-priority-task');
                return (bHasPriority ? 1 : 0) - (aHasPriority ? 1 : 0);
            });
        } else if (sortingMethod === 'dueDate') {
            // Ordenar por data de vencimento (se disponível)
            filteredTasks.sort((a, b) => {
                const aHtml = a.getHtmlRepresentation();
                const bHtml = b.getHtmlRepresentation();
                
                // Extrair datas de vencimento (se existirem)
                const aDateMatch = aHtml.match(/Vencimento: (\d{1,2}\/\d{1,2}\/\d{4})/);
                const bDateMatch = bHtml.match(/Vencimento: (\d{1,2}\/\d{1,2}\/\d{4})/);
                
                // Se ambas têm data de vencimento, comparar
                if (aDateMatch && bDateMatch) {
                    // Converter para objetos Date para comparação
                    // Formato DD/MM/YYYY para Date
                    const aParts = aDateMatch[1].split('/');
                    const bParts = bDateMatch[1].split('/');
                    
                    const aDate = new Date(aParts[2], aParts[1] - 1, aParts[0]);
                    const bDate = new Date(bParts[2], bParts[1] - 1, bParts[0]);
                    
                    return aDate - bDate;
                }
                
                // Priorizar tarefas com data de vencimento
                return aDateMatch ? -1 : (bDateMatch ? 1 : 0);
            });
        }
        // Para 'created' (padrão), mantém a ordem original
        
        filteredTasks.forEach(task => {
            container.innerHTML += task.getHtmlRepresentation();
            selectOptions += `<option value="${task.getId()}">${task.getTitle()}</option>`;
        });
        
        // Atualizar o select de decoração
        document.getElementById('decorate-task-select').innerHTML = selectOptions;
    }
    
    // Renderizar notificações na interface do usuário
    renderNotifications() {
        const container = document.getElementById('notifications-container');
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="list-group-item text-center text-muted">
                    Nenhuma notificação ainda
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        // Mostrar as notificações mais recentes primeiro (limite de 10)
        const recentNotifications = [...this.notifications]
            .reverse()
            .slice(0, 10);
            
        recentNotifications.forEach(notification => {
            container.innerHTML += notification.getHtmlRepresentation();
        });
    }
    
    // Encontrar uma tarefa pelo ID
    findTaskById(id) {
        return this.tasks.find(task => task.getId() === id);
    }
}