/**
 * Implementação do padrão Singleton para gerenciar configurações do usuário
 * Garante que exista apenas uma instância do gerenciador de configurações em toda a aplicação
 */
class ConfigManager {
    constructor() {
        // Verifica se já existe uma instância
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        // Inicializa as configurações padrão
        this.config = {
            theme: 'light', // tema: light ou dark
            taskSorting: 'created', // ordenação: created, priority, dueDate
            notifications: {
                showTaskCreated: true,
                showTaskDecorated: true
            }
        };

        // Carrega configurações do localStorage, se existirem
        this.loadFromLocalStorage();

        // Armazena a instância
        ConfigManager.instance = this;
    }

    /**
     * Carrega configurações salvas no localStorage
     */
    loadFromLocalStorage() {
        const savedConfig = localStorage.getItem('taskManagerConfig');
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig };
            } catch (e) {
                console.error('Erro ao carregar configurações:', e);
            }
        }
    }

    /**
     * Salva configurações atuais no localStorage
     */
    saveToLocalStorage() {
        localStorage.setItem('taskManagerConfig', JSON.stringify(this.config));
    }

    /**
     * Obtém uma configuração específica
     * @param {string} key - A chave da configuração
     * @returns {*} O valor da configuração
     */
    get(key) {
        // Suporta acesso a propriedades aninhadas usando notação de ponto
        if (key.includes('.')) {
            const parts = key.split('.');
            let value = this.config;
            for (const part of parts) {
                if (value === undefined) return undefined;
                value = value[part];
            }
            return value;
        }
        return this.config[key];
    }

    /**
     * Define uma configuração específica
     * @param {string} key - A chave da configuração
     * @param {*} value - O valor a ser definido
     */
    set(key, value) {
        // Suporta acesso a propriedades aninhadas usando notação de ponto
        if (key.includes('.')) {
            const parts = key.split('.');
            let target = this.config;
            for (let i = 0; i < parts.length - 1; i++) {
                if (target[parts[i]] === undefined) {
                    target[parts[i]] = {};
                }
                target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = value;
        } else {
            this.config[key] = value;
        }
        this.saveToLocalStorage();
    }

    /**
     * Restaura as configurações para o padrão
     */
    resetToDefaults() {
        this.config = {
            theme: 'light',
            taskSorting: 'created',
            notifications: {
                showTaskCreated: true,
                showTaskDecorated: true
            }
        };
        this.saveToLocalStorage();
    }
}

// Exporta uma instância única do ConfigManager
const configManager = new ConfigManager(); 