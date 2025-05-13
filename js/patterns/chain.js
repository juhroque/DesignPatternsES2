/**
 * Implementação do padrão Chain of Responsibility para aprovação de tarefas
 */

// Classe base do manipulador de aprovação
class ApprovalHandler {
    constructor() {
        this.nextHandler = null;
    }
    
    /**
     * Define o próximo manipulador na cadeia
     * @param {ApprovalHandler} handler - O próximo manipulador
     * @returns {ApprovalHandler} O manipulador definido para permitir encadeamento
     */
    setNext(handler) {
        this.nextHandler = handler;
        return handler; // Permitir encadeamento
    }
    
    /**
     * Método para processar a aprovação
     * @param {ApprovalTaskDecorator} taskDecorator - O decorador da tarefa a ser aprovada
     * @param {string} approverLevel - O nível de acesso do aprovador
     * @returns {boolean} Aprovação bem-sucedida ou não
     */
    handle(taskDecorator, approverLevel) {
        // Se não puder processar, passar para o próximo na cadeia
        if (this.nextHandler) {
            return this.nextHandler.handle(taskDecorator, approverLevel);
        }
        
        // Se não houver próximo, retornar falso (não aprovado)
        return false;
    }
}

/**
 * Manipulador de aprovação para o nível Viewer
 * Primeira etapa na cadeia de aprovação
 */
class ViewerApprovalHandler extends ApprovalHandler {
    handle(taskDecorator, approverLevel) {
        console.log(`ViewerApprovalHandler: Verificando tarefa ${taskDecorator.getId()} com nível ${approverLevel}`);
        
        // Verificar se o usuário tem nível de acesso adequado
        if (approverLevel === AccessLevels.VIEWER || approverLevel === AccessLevels.EDITOR || approverLevel === AccessLevels.ADMIN) {
            // Validação básica: tarefa precisa estar concluída
            if (taskDecorator.getStatus() === 'concluida') {
                // Marcar como aprovada por viewer
                taskDecorator.addApprovalStep('viewer');
                console.log(`Chain: Tarefa ${taskDecorator.getId()} aprovada por Viewer`);
                
                // Passar para o próximo aprovador, se houver
                if (this.nextHandler) {
                    return this.nextHandler.handle(taskDecorator, approverLevel);
                }
                return true;
            } else {
                console.log(`Chain: Tarefa ${taskDecorator.getId()} não está concluída. Status atual: ${taskDecorator.getStatus()}`);
                return false;
            }
        }
        
        // Se não tiver permissão para este nível
        console.log(`Chain: Usuário com nível ${approverLevel} não pode aprovar como Viewer`);
        return this.nextHandler ? this.nextHandler.handle(taskDecorator, approverLevel) : false;
    }
}

/**
 * Manipulador de aprovação para o nível Editor
 * Segunda etapa na cadeia de aprovação
 */
class EditorApprovalHandler extends ApprovalHandler {
    handle(taskDecorator, approverLevel) {
        console.log(`EditorApprovalHandler: Verificando tarefa ${taskDecorator.getId()} com nível ${approverLevel}`);
        
        // Verificar se o usuário tem nível de acesso adequado
        if (approverLevel === AccessLevels.EDITOR || approverLevel === AccessLevels.ADMIN) {
            // Verificar se já foi aprovada pelo nível anterior
            if (taskDecorator.hasApprovalStep('viewer')) {
                // Marcar como aprovada por editor
                taskDecorator.addApprovalStep('editor');
                console.log(`Chain: Tarefa ${taskDecorator.getId()} aprovada por Editor`);
                
                // Passar para o próximo aprovador, se houver
                if (this.nextHandler) {
                    return this.nextHandler.handle(taskDecorator, approverLevel);
                }
                return true;
            } else {
                console.log(`Chain: Tarefa ${taskDecorator.getId()} ainda não foi aprovada por Viewer. Aprovações: ${taskDecorator.getApprovalSteps()}`);
                return false;
            }
        }
        
        // Se não tiver permissão para este nível
        console.log(`Chain: Usuário com nível ${approverLevel} não pode aprovar como Editor`);
        return this.nextHandler ? this.nextHandler.handle(taskDecorator, approverLevel) : false;
    }
}

/**
 * Manipulador de aprovação para o nível Admin
 * Etapa final na cadeia de aprovação
 */
class AdminApprovalHandler extends ApprovalHandler {
    handle(taskDecorator, approverLevel) {
        console.log(`AdminApprovalHandler: Verificando tarefa ${taskDecorator.getId()} com nível ${approverLevel}`);
        
        // Verificar se o usuário tem nível de acesso adequado
        if (approverLevel === AccessLevels.ADMIN) {
            // Verificar se já foi aprovada pelo nível anterior
            if (taskDecorator.hasApprovalStep('editor')) {
                // Marcar como aprovada por admin (aprovação final)
                taskDecorator.addApprovalStep('admin');
                taskDecorator.setApproved(true);
                console.log(`Chain: Tarefa ${taskDecorator.getId()} aprovada por Admin (aprovação final)`);
                return true;
            } else {
                console.log(`Chain: Tarefa ${taskDecorator.getId()} ainda não foi aprovada por Editor. Aprovações: ${taskDecorator.getApprovalSteps()}`);
                return false;
            }
        }
        
        // Se não tiver permissão para este nível
        console.log(`Chain: Usuário com nível ${approverLevel} não pode aprovar como Admin`);
        return false;
    }
}

/**
 * Classe que gerencia a cadeia de aprovação completa
 */
class ApprovalChain {
    constructor() {
        // Criar os manipuladores
        const viewerHandler = new ViewerApprovalHandler();
        const editorHandler = new EditorApprovalHandler();
        const adminHandler = new AdminApprovalHandler();
        
        // Configurar a cadeia de responsabilidade
        viewerHandler.setNext(editorHandler).setNext(adminHandler);
        
        // Armazenar o primeiro manipulador da cadeia
        this.chain = viewerHandler;
    }
    
    /**
     * Processa uma tarefa através da cadeia de aprovação
     * @param {ApprovalTaskDecorator} taskDecorator - O decorador da tarefa a ser aprovada
     * @param {string} approverLevel - O nível de acesso do aprovador
     * @returns {boolean} Aprovação bem-sucedida ou não
     */
    processApproval(taskDecorator, approverLevel) {
        return this.chain.handle(taskDecorator, approverLevel);
    }
} 