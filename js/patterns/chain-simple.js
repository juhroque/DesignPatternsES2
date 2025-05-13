/**
 * Implementação simplificada do padrão Chain of Responsibility
 * para aprovação de tarefas
 */

// Objeto para armazenar os dados de aprovação das tarefas
// Usamos um objeto global simples em vez de modificar a classe Task
const taskApprovals = {
    steps: {}, // Armazena as etapas de aprovação para cada tarefa: {taskId: ['viewer', 'editor', 'admin']}
    
    // Adicionar uma etapa de aprovação
    addApprovalStep(taskId, level) {
        if (!this.steps[taskId]) {
            this.steps[taskId] = [];
        }
        if (!this.steps[taskId].includes(level)) {
            this.steps[taskId].push(level);
            console.log(`Aprovação: Tarefa ${taskId} aprovada por ${level}`);
        }
    },
    
    // Verificar se uma tarefa possui uma etapa específica
    hasApprovalStep(taskId, level) {
        return this.steps[taskId] && this.steps[taskId].includes(level);
    },
    
    // Obter todas as etapas de uma tarefa
    getApprovalSteps(taskId) {
        return this.steps[taskId] || [];
    },
    
    // Verificar se uma tarefa está totalmente aprovada
    isFullyApproved(taskId) {
        const steps = this.steps[taskId] || [];
        return steps.includes('admin');
    }
};

/**
 * Manipulador base (handler) para a cadeia
 */
class ApprovalHandler {
    constructor() {
        this.nextHandler = null;
    }
    
    setNext(handler) {
        this.nextHandler = handler;
        return handler; // Para encadeamento
    }
    
    // Método abstrato para processar a solicitação
    process(taskId, level) {
        if (this.nextHandler) {
            return this.nextHandler.process(taskId, level);
        }
        return false;
    }
}

/**
 * Manipulador para aprovação do nível Viewer
 */
class ViewerHandler extends ApprovalHandler {
    process(taskId, accessLevel) {
        // Verificar permissão
        if (accessLevel === 'viewer' || accessLevel === 'editor' || accessLevel === 'admin') {
            // Aprovar neste nível
            taskApprovals.addApprovalStep(taskId, 'viewer');
            console.log(`ViewerHandler: Tarefa ${taskId} aprovada por viewer`);
            
            // Passar para o próximo nível se o usuário tiver permissão
            if (accessLevel === 'editor' || accessLevel === 'admin') {
                return this.nextHandler ? this.nextHandler.process(taskId, accessLevel) : true;
            }
            return true;
        }
        
        return false;
    }
}

/**
 * Manipulador para aprovação do nível Editor
 */
class EditorHandler extends ApprovalHandler {
    process(taskId, accessLevel) {
        // Verificar se o nível anterior já aprovou
        if (!taskApprovals.hasApprovalStep(taskId, 'viewer')) {
            console.log(`EditorHandler: Tarefa ${taskId} ainda não foi aprovada por viewer`);
            return false;
        }
        
        // Verificar permissão
        if (accessLevel === 'editor' || accessLevel === 'admin') {
            // Aprovar neste nível
            taskApprovals.addApprovalStep(taskId, 'editor');
            console.log(`EditorHandler: Tarefa ${taskId} aprovada por editor`);
            
            // Passar para o próximo nível se o usuário tiver permissão
            if (accessLevel === 'admin') {
                return this.nextHandler ? this.nextHandler.process(taskId, accessLevel) : true;
            }
            return true;
        }
        
        return false;
    }
}

/**
 * Manipulador para aprovação do nível Admin
 */
class AdminHandler extends ApprovalHandler {
    process(taskId, accessLevel) {
        // Verificar se o nível anterior já aprovou
        if (!taskApprovals.hasApprovalStep(taskId, 'editor')) {
            console.log(`AdminHandler: Tarefa ${taskId} ainda não foi aprovada por editor`);
            return false;
        }
        
        // Verificar permissão
        if (accessLevel === 'admin') {
            // Aprovar neste nível
            taskApprovals.addApprovalStep(taskId, 'admin');
            console.log(`AdminHandler: Tarefa ${taskId} aprovada por admin (aprovação final)`);
            return true;
        }
        
        return false;
    }
}

// Criar e configurar a cadeia
const approvalChain = (() => {
    const viewerHandler = new ViewerHandler();
    const editorHandler = new EditorHandler();
    const adminHandler = new AdminHandler();
    
    viewerHandler.setNext(editorHandler).setNext(adminHandler);
    
    return {
        // Iniciar o processo de aprovação
        approve(taskId, accessLevel) {
            console.log(`Iniciando aprovação da tarefa ${taskId} com nível ${accessLevel}`);
            return viewerHandler.process(taskId, accessLevel);
        }
    };
})(); 