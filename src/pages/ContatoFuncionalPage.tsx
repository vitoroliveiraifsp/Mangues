import { useState } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle, Phone, MapPin } from 'lucide-react';

interface FormData {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  assunto?: string;
  mensagem?: string;
}

export function ContatoFuncionalPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Por favor, digite seu nome';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Por favor, digite seu email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor, digite um email válido';
    }

    if (!formData.assunto.trim()) {
      newErrors.assunto = 'Por favor, escolha um assunto';
    }

    if (!formData.mensagem.trim()) {
      newErrors.mensagem = 'Por favor, escreva sua mensagem';
    } else if (formData.mensagem.trim().length < 10) {
      newErrors.mensagem = 'Sua mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso (em um projeto real, aqui você enviaria para um backend)
      // Em desenvolvimento, mostra dados no console para debugging
      if (import.meta.env.DEV) {
        console.log('Formulário enviado:', formData);
      }
      
      setSubmitStatus('success');
      setFormData({
        nome: '',
        email: '',
        assunto: '',
        mensagem: ''
      });
      setErrors({});
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            📧 Entre em Contato
          </h1>
          <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Tem alguma dúvida sobre o projeto, sugestões ou quer conversar sobre os mangues? 
            Adoraríamos ouvir você! Preencha o formulário abaixo e entraremos em contato.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                🌟 Informações de Contato
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Email</h3>
                    <p className="text-gray-600">vtr17.on@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Telefone</h3>
                    <p className="text-gray-600">(11) 997826931</p>
                    <p className="text-sm text-gray-500">Todos os dias</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Localização</h3>
                    <p className="text-gray-600">IFSP - Campus Salto</p>
                    <p className="text-sm text-gray-500">Salto - SP, Brasil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Team */}
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-6 md:p-8 text-white">
              <h3 className="text-xl font-bold mb-4">👥 Nossa Equipe</h3>
              <p className="text-sm md:text-base opacity-90 leading-relaxed">
                Somos estudantes apaixonados por tecnologia e meio ambiente. 
                Este projeto combina nosso amor pela natureza com conhecimentos de programação!
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-2">🌱</div>
                  <p className="text-xs md:text-sm font-medium">Educação Ambiental</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-2">💻</div>
                  <p className="text-xs md:text-sm font-medium">Desenvolvimento Web</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                ✍️ Envie sua Mensagem
              </h2>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-2xl flex items-center space-x-3" data-testid="status-success">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-800">Mensagem enviada com sucesso! 🎉</h4>
                    <p className="text-green-700">Obrigado pelo contato! Responderemos em breve.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-2xl flex items-center space-x-3" data-testid="status-error">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800">Ops! Algo deu errado</h4>
                    <p className="text-red-700">Por favor, tente novamente ou entre em contato por email.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div>
                    <label htmlFor="nome" className="block text-sm font-bold text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite seu nome completo"
                      data-testid="input-nome"
                    />
                    {errors.nome && (
                      <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="seu.email@exemplo.com"
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Assunto */}
                <div>
                  <label htmlFor="assunto" className="block text-sm font-bold text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Assunto *
                  </label>
                  <select
                    id="assunto"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.assunto ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    data-testid="select-assunto"
                  >
                    <option value="">Escolha um assunto</option>
                    <option value="duvida-projeto">Dúvida sobre o projeto</option>
                    <option value="sugestao">Sugestão de melhoria</option>
                    <option value="educacao">Conteúdo educativo</option>
                    <option value="tecnico">Questão técnica</option>
                    <option value="parceria">Proposta de parceria</option>
                    <option value="outro">Outro</option>
                  </select>
                  {errors.assunto && (
                    <p className="mt-1 text-sm text-red-600">{errors.assunto}</p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="mensagem" className="block text-sm font-bold text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      errors.mensagem ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Escreva sua mensagem aqui... Conte-nos suas dúvidas, sugestões ou comentários sobre o projeto!"
                    data-testid="textarea-mensagem"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.mensagem ? (
                      <p className="text-sm text-red-600">{errors.mensagem}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Mínimo 10 caracteres</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {formData.mensagem.length}/1000
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 
                             transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                    }`}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
            ❓ Perguntas Frequentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-bold text-green-800 mb-2">Como posso usar este projeto na minha escola?</h4>
                <p className="text-green-700 text-sm">
                  Nosso projeto é educativo e gratuito! Você pode usar o conteúdo em sala de aula. 
                  Entre em contato para mais informações sobre adaptações.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-2">Vocês fazem apresentações nas escolas?</h4>
                <p className="text-blue-700 text-sm">
                  Sim! Adoramos compartilhar nosso conhecimento. Envie uma mensagem com os detalhes 
                  da sua escola e veremos como podemos ajudar.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <h4 className="font-bold text-purple-800 mb-2">Como foi desenvolvido este site?</h4>
                <p className="text-purple-700 text-sm">
                  Usamos tecnologias modernas como React e TypeScript. Se você tem interesse em 
                  programação, ficaremos felizes em contar mais sobre o processo!
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-2">Posso sugerir melhorias?</h4>
                <p className="text-orange-700 text-sm">
                  Claro! Suas sugestões são muito valiosas. Use o formulário acima com o assunto 
                  "Sugestão de melhoria" e conte-nos suas ideias!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}