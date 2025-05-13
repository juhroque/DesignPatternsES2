/**
 * Implementação do padrão Proxy para controle de acesso
 * Simula diferentes níveis de acesso para demonstração do padrão
 */

// Níveis de acesso disponíveis
const AccessLevels = {
    VIEWER: 'viewer',     // Apenas visualização
    EDITOR: 'editor',     // Pode editar, mas não excluir
    ADMIN: 'admin'        // Acesso completo
};

/**
 * Singleton para gerenciar o nível de acesso atual da aplicação
 */
class AccessManager {
    constructor() {
        // Singleton
        if (AccessManager.instance) {
            return AccessManager.instance;
        }
        
        // Inicia com nível administrador por padrão
        this.currentAccessLevel = AccessLevels.ADMIN;
        
        AccessManager.instance = this;
    }
    
    /**
     * Define o nível de acesso atual
     * @param {string} level - Nível de acesso do AccessLevels
     */
    setAccessLevel(level) {
        if (Object.values(AccessLevels).includes(level)) {
            this.currentAccessLevel = level;
            console.log(`Proxy: Nível de acesso alterado para ${level}`);
            return true;
        }
        return false;
    }
    
    /**
     * Obtém o nível de acesso atual
     * @returns {string} Nível de acesso atual
     */
    getAccessLevel() {
        return this.currentAccessLevel;
    }
    
    /**
     * Verifica se o nível atual tem permissão para uma ação específica
     * @param {string} action - Ação a ser verificada ("view", "edit", "delete")
     * @returns {boolean} Verdadeiro se tiver permissão
     */
    hasPermission(action) {
        switch (action) {
            case 'view':
                return true;
                
            case 'edit':
                return this.currentAccessLevel === AccessLevels.EDITOR || 
                       this.currentAccessLevel === AccessLevels.ADMIN;
                
            case 'delete':
                return this.currentAccessLevel === AccessLevels.ADMIN;
                
            default:
                console.error(`Proxy: Ação desconhecida: ${action}`);
                return false;
        }
    }
}

/**
 * Proxy para controle de acesso às tarefas
 */
class AccessControlProxy {
    constructor(taskList) {
        this.taskList = taskList;
        this.accessManager = new AccessManager();
    }
    
    /**
     * Obtém a lista de tarefas com controle de acesso
     * @returns {Array} Lista de tarefas
     */
    getTasks() {
        return this.taskList;
    }
    
    /**
     * Tenta adicionar uma nova tarefa à lista
     * @param {Task} task - Tarefa a ser adicionada
     * @returns {boolean} Sucesso da operação
     */
    addTask(task) {
        if (this.accessManager.hasPermission('edit')) {
            this.taskList.push(task);
            return true;
        } else {
            console.log('Proxy: Permissão negada - Você não pode adicionar tarefas com o nível de acesso atual');
            return false;
        }
    }
    
    /**
     * Tenta atualizar o status de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {string} status - Novo status
     * @returns {boolean} Sucesso da operação
     */
    updateTaskStatus(taskId, status) {
        if (this.accessManager.hasPermission('edit')) {
            const task = this.findTaskById(taskId);
            if (task) {
                task.setStatus(status);
                return true;
            }
        } else {
            console.log('Proxy: Permissão negada - Você não pode alterar tarefas com o nível de acesso atual');
        }
        return false;
    }
    
    /**
     * Tenta excluir uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {boolean} Sucesso da operação
     */
    deleteTask(taskId) {
        if (this.accessManager.hasPermission('delete')) {
            const index = this.taskList.findIndex(task => task.getId() === taskId);
            if (index !== -1) {
                this.taskList.splice(index, 1);
                return true;
            }
        } else {
            console.log('Proxy: Permissão negada - Você não pode excluir tarefas com o nível de acesso atual');
        }
        return false;
    }
    
    /**
     * Aplica decoradores a uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {Task} decoratedTask - Tarefa decorada
     * @returns {boolean} Sucesso da operação
     */
    decorateTask(taskId, decoratedTask) {
        if (this.accessManager.hasPermission('edit')) {
            const index = this.taskList.findIndex(task => task.getId() === taskId);
            if (index !== -1) {
                this.taskList[index] = decoratedTask;
                return true;
            }
        } else {
            console.log('Proxy: Permissão negada - Você não pode decorar tarefas com o nível de acesso atual');
        }
        return false;
    }
    
    /**
     * Encontra uma tarefa pelo ID
     * @param {number} id - ID da tarefa
     * @returns {Task|null} A tarefa ou null se não encontrada
     */
    findTaskById(id) {
        return this.taskList.find(task => task.getId() === id);
    }
}

// exportar pra usar na aplicação
const accessManager = new AccessManager(); 