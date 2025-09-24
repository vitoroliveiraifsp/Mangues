// Blockchain service for digital certificates
interface Certificate {
  id: string;
  userId: string;
  type: 'quiz_master' | 'memory_champion' | 'connection_expert' | 'eco_warrior';
  title: string;
  description: string;
  criteria: string;
  issuedAt: string;
  blockHash: string;
  transactionId: string;
  metadata: {
    score: number;
    category?: string;
    difficulty?: string;
    achievements: string[];
  };
}

interface BlockchainTransaction {
  id: string;
  type: 'certificate_issue' | 'certificate_verify';
  data: any;
  timestamp: number;
  hash: string;
  previousHash: string;
}

class BlockchainService {
  private certificates: Map<string, Certificate> = new Map();
  private blockchain: BlockchainTransaction[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    await this.loadStoredData();
    this.isInitialized = true;
    console.log('🔗 Blockchain service initialized');
  }

  private async loadStoredData() {
    try {
      const stored = localStorage.getItem('mangues_certificates');
      if (stored) {
        const data = JSON.parse(stored);
        this.certificates = new Map(data.certificates || []);
        this.blockchain = data.blockchain || [];
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  }

  private saveData() {
    try {
      const data = {
        certificates: Array.from(this.certificates.entries()),
        blockchain: this.blockchain,
        lastUpdate: Date.now()
      };
      localStorage.setItem('mangues_certificates', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving blockchain data:', error);
    }
  }

  private generateHash(data: string): string {
    // Simple hash function for demo (in production, use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private createTransaction(type: BlockchainTransaction['type'], data: any): BlockchainTransaction {
    const previousHash = this.blockchain.length > 0 
      ? this.blockchain[this.blockchain.length - 1].hash 
      : '0';

    const transaction: BlockchainTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      hash: '',
      previousHash
    };

    // Generate hash based on transaction data
    const hashData = JSON.stringify({
      id: transaction.id,
      type: transaction.type,
      data: transaction.data,
      timestamp: transaction.timestamp,
      previousHash: transaction.previousHash
    });

    transaction.hash = this.generateHash(hashData);
    return transaction;
  }

  async issueCertificate(
    userId: string,
    type: Certificate['type'],
    metadata: Certificate['metadata']
  ): Promise<Certificate> {
    if (!this.isInitialized) await this.initialize();

    const certificateData = {
      userId,
      type,
      metadata,
      issuedAt: new Date().toISOString()
    };

    // Create blockchain transaction
    const transaction = this.createTransaction('certificate_issue', certificateData);
    this.blockchain.push(transaction);

    // Create certificate
    const certificate: Certificate = {
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title: this.getCertificateTitle(type),
      description: this.getCertificateDescription(type, metadata),
      criteria: this.getCertificateCriteria(type),
      issuedAt: certificateData.issuedAt,
      blockHash: transaction.hash,
      transactionId: transaction.id,
      metadata
    };

    this.certificates.set(certificate.id, certificate);
    this.saveData();

    console.log(`🏆 Certificate issued: ${certificate.title} for user ${userId}`);
    return certificate;
  }

  async verifyCertificate(certificateId: string): Promise<{
    isValid: boolean;
    certificate?: Certificate;
    verificationDetails: any;
  }> {
    if (!this.isInitialized) await this.initialize();

    const certificate = this.certificates.get(certificateId);
    if (!certificate) {
      return {
        isValid: false,
        verificationDetails: { error: 'Certificate not found' }
      };
    }

    // Verify blockchain integrity
    const transaction = this.blockchain.find(tx => tx.id === certificate.transactionId);
    if (!transaction) {
      return {
        isValid: false,
        certificate,
        verificationDetails: { error: 'Transaction not found in blockchain' }
      };
    }

    // Verify hash integrity
    const expectedHash = this.generateHash(JSON.stringify({
      id: transaction.id,
      type: transaction.type,
      data: transaction.data,
      timestamp: transaction.timestamp,
      previousHash: transaction.previousHash
    }));

    const isValid = expectedHash === transaction.hash;

    return {
      isValid,
      certificate,
      verificationDetails: {
        transactionId: transaction.id,
        blockHash: transaction.hash,
        issuedAt: certificate.issuedAt,
        verified: isValid
      }
    };
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    if (!this.isInitialized) await this.initialize();

    return Array.from(this.certificates.values())
      .filter(cert => cert.userId === userId)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  async checkEligibility(userId: string, gameStats: any): Promise<Certificate['type'][]> {
    const eligibleTypes: Certificate['type'][] = [];

    // Quiz Master: 10+ quiz games with 80%+ average
    if (gameStats.quiz?.played >= 10 && gameStats.quiz?.averageScore >= 800) {
      eligibleTypes.push('quiz_master');
    }

    // Memory Champion: 15+ memory games with average time < 60s
    if (gameStats.memoria?.played >= 15 && gameStats.memoria?.averageTime < 60) {
      eligibleTypes.push('memory_champion');
    }

    // Connection Expert: 20+ connection games with 90%+ accuracy
    if (gameStats.conexoes?.played >= 20 && gameStats.conexoes?.accuracy >= 0.9) {
      eligibleTypes.push('connection_expert');
    }

    // Eco Warrior: Completed all game types + high engagement
    if (gameStats.totalGames >= 50 && gameStats.timeSpent >= 7200) { // 2+ hours
      eligibleTypes.push('eco_warrior');
    }

    return eligibleTypes;
  }

  private getCertificateTitle(type: Certificate['type']): string {
    const titles = {
      quiz_master: 'Mestre do Quiz dos Mangues',
      memory_champion: 'Campeão da Memória Ecológica',
      connection_expert: 'Especialista em Conexões Naturais',
      eco_warrior: 'Guerreiro Ecológico dos Mangues'
    };
    return titles[type];
  }

  private getCertificateDescription(type: Certificate['type'], metadata: Certificate['metadata']): string {
    const descriptions = {
      quiz_master: `Demonstrou conhecimento excepcional sobre ecossistemas de mangue com pontuação média de ${metadata.score} pontos.`,
      memory_champion: `Alcançou maestria no jogo da memória com performance consistente e tempo médio otimizado.`,
      connection_expert: `Dominou as conexões entre espécies e suas adaptações com precisão exemplar.`,
      eco_warrior: `Completou todos os desafios educativos e demonstrou comprometimento excepcional com a conservação ambiental.`
    };
    return descriptions[type];
  }

  private getCertificateCriteria(type: Certificate['type']): string {
    const criteria = {
      quiz_master: 'Completar 10+ quizzes com média ≥80% de acertos',
      memory_champion: 'Completar 15+ jogos de memória com tempo médio <60s',
      connection_expert: 'Completar 20+ jogos de conexão com precisão ≥90%',
      eco_warrior: 'Completar 50+ jogos totais e 2+ horas de engajamento'
    };
    return criteria[type];
  }

  // Export certificate as downloadable file
  async exportCertificate(certificateId: string): Promise<void> {
    const verification = await this.verifyCertificate(certificateId);
    if (!verification.isValid || !verification.certificate) {
      throw new Error('Certificate is invalid or not found');
    }

    const certificate = verification.certificate;
    const exportData = {
      certificate,
      verification: verification.verificationDetails,
      exportedAt: new Date().toISOString(),
      blockchain: {
        transactionId: certificate.transactionId,
        blockHash: certificate.blockHash,
        verified: verification.isValid
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangues-certificate-${certificate.type}-${certificate.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const blockchainService = new BlockchainService();