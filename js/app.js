// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Criar e iniciar o controlador da interface
    const uiController = new UIController();
    
    // Inicializar o ConfigUI e passar a referência do UIController
    const configUI = new ConfigUI();
    configUI.setUIController(uiController);
    configUI.init();
    
    // Inicializar o AccessUI (Proxy) e passar a referência do UIController
    const accessUI = new AccessUI();
    accessUI.setUIController(uiController);
    accessUI.init();
    
    // Inicializar o ApprovalSimpleUI (Chain of Responsibility) e passar a referência do UIController
    const approvalUI = new ApprovalSimpleUI();
    approvalUI.setUIController(uiController);
    approvalUI.init();
    
    // Armazenar referência global para o ApprovalUI
    window.approvalUI = approvalUI;
    
    // Renderizar estado inicial da interface
    uiController.renderTasks();
    uiController.renderNotifications();
    approvalUI.renderApprovalTasks();
    
    console.log('Aplicação de Gerenciamento de Tarefas inicializada com sucesso!');
    console.log('Padrões de Design implementados: Singleton, Proxy, Factory Method, Decorator, Observer e Chain of Responsibility.');
});