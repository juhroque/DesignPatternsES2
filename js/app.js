// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Criar e iniciar o controlador da interface
    const uiController = new UIController();
    
    // Inicializar o ConfigUI e passar a referência do UIController
    const configUI = new ConfigUI();
    configUI.setUIController(uiController);
    configUI.init();
    
    // Renderizar estado inicial da interface
    uiController.renderTasks();
    uiController.renderNotifications();
    
    console.log('Aplicação de Gerenciamento de Tarefas inicializada com sucesso!');
    console.log('Padrões de Design implementados: Singleton, Factory Method, Decorator e Observer.');
});