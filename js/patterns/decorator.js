/**
 * Implementação do Padrão Decorator
 * 
 * O Decorator é um padrão estrutural que permite adicionar novos comportamentos
 * a objetos dinamicamente, envolvendo-os em objetos "wrapper" especiais.
 */

/**
 * Classe base para os decoradores de tarefa
 */
class TaskDecorator {
    constructor(task) {
        this.task = task;
    }
    
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

/**
 * Decorador para adicionar alta prioridade a uma tarefa
 */
class HighPriorityDecorator extends TaskDecorator {
    getTitle() {
        return `⭐ ${this.task.getTitle()}`;
    }
    
    getHtmlRepresentation() {
        let html = this.task.getHtmlRepresentation();
        html = html.replace('list-group-item task-item', 'list-group-item task-item high-priority-task');
        // Adicionando badge de prioridade alta
        html = html.replace('<span class="badge', '<span class="badge bg-danger me-2">PRIORITÁRIO</span><span class="badge');
        return html;
    }
}

/**
 * Decorador para adicionar uma etiqueta colorida a uma tarefa
 */
class ColorLabelDecorator extends TaskDecorator {
    constructor(task, color) {
        super(task);
        this.color = color;
    }
    
    getHtmlRepresentation() {
        let html = this.task.getHtmlRepresentation();
        // Adicionando etiqueta colorida
        html = html.replace('<span class="badge', `<span class="badge label-${this.color} me-2">${this.getColorName()}</span><span class="badge`);
        return html;
    }
    
    getColorName() {
        switch(this.color) {
            case 'red': return 'Urgente';
            case 'green': return 'Fácil';
            case 'blue': return 'Em progresso';
            case 'yellow': return 'Atenção';
            default: return this.color;
        }
    }
}

/**
 * Decorador para adicionar data de vencimento a uma tarefa
 */
class DueDateDecorator extends TaskDecorator {
    constructor(task, dueDate) {
        super(task);
        this.dueDate = new Date(dueDate);
    }
    
    getHtmlRepresentation() {
        let html = this.task.getHtmlRepresentation();
        // Formatar a data no formato DD/MM/YYYY
        const day = this.dueDate.getDate().toString().padStart(2, '0');
        const month = (this.dueDate.getMonth() + 1).toString().padStart(2, '0');
        const year = this.dueDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        
        // Adicionar a data de vencimento após a data de criação
        html = html.replace(
            `Criada em: ${this.task.getCreatedAt().toLocaleString()}`,
            `Criada em: ${this.task.getCreatedAt().toLocaleString()} | <strong class="due-date">Vencimento: ${formattedDate}</strong>`
        );
        return html;
    }
}

class ConfidentialDecorator extends TaskDecorator {
    constructor(task) {
        super(task);

    }

    getTitle() {
        return `🔒 ${this.task.getTitle()}`;
    }

    getDescription() {
        return 'Descrição confidencial.';
    }

    getHtmlRepresentation() {
        let html = this.task.getHtmlRepresentation();
        html = html.replace('list-group-item task-item', 'list-group-item task-item confidential-task');
        html = html.replace('<span class="badge', '<span class="badge bg-dark me-2">CONFIDENCIAL</span><span class="badge');
        return html;
    }
}
