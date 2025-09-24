import express from 'express';
import crypto from 'crypto';
import { query } from '../config/database.js';

const router = express.Router();

// Simple blockchain implementation for certificates
class CertificateBlockchain {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      data: { type: 'genesis', message: 'Mangues Certificate Blockchain Genesis' },
      previousHash: '0',
      hash: this.calculateHash(0, Date.now(), { type: 'genesis' }, '0')
    };
    this.chain.push(genesisBlock);
  }

  calculateHash(index, timestamp, data, previousHash) {
    return crypto
      .createHash('sha256')
      .update(index + timestamp + JSON.stringify(data) + previousHash)
      .digest('hex');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const previousBlock = this.getLatestBlock();
    const newBlock = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      data,
      previousHash: previousBlock.hash,
      hash: ''
    };
    
    newBlock.hash = this.calculateHash(
      newBlock.index,
      newBlock.timestamp,
      newBlock.data,
      newBlock.previousHash
    );
    
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash
      )) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

const certificateBlockchain = new CertificateBlockchain();

// POST /api/certificates/issue - Issue a new certificate
router.post('/issue', async (req, res) => {
  try {
    const { userId, type, metadata } = req.body;

    if (!userId || !type || !metadata) {
      return res.status(400).json({ 
        error: 'userId, type e metadata são obrigatórios' 
      });
    }

    // Validate certificate type
    const validTypes = ['quiz_master', 'memory_champion', 'connection_expert', 'eco_warrior'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Tipo de certificado inválido' 
      });
    }

    // Create certificate data
    const certificateData = {
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title: getCertificateTitle(type),
      description: getCertificateDescription(type, metadata),
      criteria: getCertificateCriteria(type),
      issuedAt: new Date().toISOString(),
      metadata
    };

    // Add to blockchain
    const block = certificateBlockchain.addBlock({
      type: 'certificate_issue',
      certificate: certificateData
    });

    // Store in database (if available)
    try {
      await query(`
        INSERT INTO certificates (
          id, user_id, type, title, description, criteria, 
          issued_at, block_hash, transaction_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        certificateData.id,
        userId,
        type,
        certificateData.title,
        certificateData.description,
        certificateData.criteria,
        certificateData.issuedAt,
        block.hash,
        block.index.toString(),
        JSON.stringify(metadata)
      ]);
    } catch (dbError) {
      console.log('Database not available, using blockchain only');
    }

    res.status(201).json({
      certificate: {
        ...certificateData,
        blockHash: block.hash,
        transactionId: block.index.toString()
      },
      blockchain: {
        blockIndex: block.index,
        hash: block.hash,
        timestamp: block.timestamp
      }
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/certificates/verify/:id - Verify a certificate
router.get('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find certificate in blockchain
    const certificateBlock = certificateBlockchain.chain.find(block => 
      block.data.certificate && block.data.certificate.id === id
    );

    if (!certificateBlock) {
      return res.status(404).json({ 
        error: 'Certificado não encontrado' 
      });
    }

    // Verify blockchain integrity
    const isValid = certificateBlockchain.isChainValid();

    res.json({
      isValid,
      certificate: certificateBlock.data.certificate,
      verification: {
        blockIndex: certificateBlock.index,
        blockHash: certificateBlock.hash,
        timestamp: certificateBlock.timestamp,
        chainValid: isValid
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/certificates/user/:userId - Get user certificates
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all certificates for user in blockchain
    const userCertificates = certificateBlockchain.chain
      .filter(block => 
        block.data.certificate && 
        block.data.certificate.userId === userId
      )
      .map(block => ({
        ...block.data.certificate,
        blockHash: block.hash,
        transactionId: block.index.toString(),
        verifiedAt: new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

    res.json(userCertificates);
  } catch (error) {
    console.error('Error getting user certificates:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/certificates/blockchain - Get blockchain info
router.get('/blockchain', (req, res) => {
  try {
    const chainInfo = {
      length: certificateBlockchain.chain.length,
      isValid: certificateBlockchain.isChainValid(),
      latestBlock: certificateBlockchain.getLatestBlock(),
      totalCertificates: certificateBlockchain.chain.filter(block => 
        block.data.type === 'certificate_issue'
      ).length
    };

    res.json(chainInfo);
  } catch (error) {
    console.error('Error getting blockchain info:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Helper functions
function getCertificateTitle(type) {
  const titles = {
    quiz_master: 'Mestre do Quiz dos Mangues',
    memory_champion: 'Campeão da Memória Ecológica',
    connection_expert: 'Especialista em Conexões Naturais',
    eco_warrior: 'Guerreiro Ecológico dos Mangues'
  };
  return titles[type] || 'Certificado dos Mangues';
}

function getCertificateDescription(type, metadata) {
  const descriptions = {
    quiz_master: `Demonstrou conhecimento excepcional sobre ecossistemas de mangue com pontuação média de ${metadata.score} pontos.`,
    memory_champion: `Alcançou maestria no jogo da memória com performance consistente e tempo médio otimizado.`,
    connection_expert: `Dominou as conexões entre espécies e suas adaptações com precisão exemplar.`,
    eco_warrior: `Completou todos os desafios educativos e demonstrou comprometimento excepcional com a conservação ambiental.`
  };
  return descriptions[type] || 'Certificado de participação no programa educativo Mundo dos Mangues.';
}

function getCertificateCriteria(type) {
  const criteria = {
    quiz_master: 'Completar 10+ quizzes com média ≥80% de acertos',
    memory_champion: 'Completar 15+ jogos de memória com tempo médio <60s',
    connection_expert: 'Completar 20+ jogos de conexão com precisão ≥90%',
    eco_warrior: 'Completar 50+ jogos totais e 2+ horas de engajamento'
  };
  return criteria[type] || 'Participação ativa no programa educativo';
}

export default router;