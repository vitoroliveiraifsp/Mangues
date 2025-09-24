import { Link } from 'react-router-dom';
import { Leaf, Network, AlertTriangle, Gamepad2, Waves, Fish, TreePine, Users } from 'lucide-react';

const navigationCards = [
	{
		path: '/biodiversidade',
		title: 'Vida no Mangue',
		description: 'Descubra os animais e plantas que vivem neste lugar especial!',
		icon: Leaf,
		color: 'from-green-400 to-green-600',
		hoverColor: 'hover:from-green-500 hover:to-green-700',
	},
	{
		path: '/estrutura',
		title: 'Como Funciona',
		description: 'Entenda como todos os seres vivos se ajudam no mangue!',
		icon: Network,
		color: 'from-blue-400 to-blue-600',
		hoverColor: 'hover:from-blue-500 hover:to-blue-700',
	},
	{
		path: '/ameacas',
		title: 'Vamos Cuidar',
		description: 'Aprenda como proteger este ambiente importante!',
		icon: AlertTriangle,
		color: 'from-orange-400 to-orange-600',
		hoverColor: 'hover:from-orange-500 hover:to-orange-700',
	},
	{
		path: '/videos',
		title: 'Vídeos Educativos',
		description: 'Assista vídeos incríveis sobre a vida nos mangues!',
		icon: BookOpen,
		color: 'from-teal-400 to-teal-600',
		hoverColor: 'hover:from-teal-500 hover:to-teal-700',
	},
	{
		path: '/jogo-da-memoria',
		title: 'Jogo da Memória',
		description: 'Teste seus conhecimentos com um jogo divertido!',
		icon: Gamepad2,
		color: 'from-purple-400 to-purple-600',
		hoverColor: 'hover:from-purple-500 hover:to-purple-700',
	},
	{
		path: '/jogo-conexoes',
		title: 'Conecte Superpoderes',
		description: 'Conecte cada animal com sua habilidade especial!',
		icon: Network,
		color: 'from-indigo-400 to-indigo-600',
		hoverColor: 'hover:from-indigo-500 hover:to-indigo-700',
	},
	{
		path: '/quiz',
		title: 'Quiz Interativo',
		description: 'Responda perguntas e teste seus conhecimentos!',
		icon: Gamepad2,
		color: 'from-blue-400 to-blue-600',
		hoverColor: 'hover:from-blue-500 hover:to-blue-700',
	},
	{
		path: '/gamificacao',
		title: 'Missões & Conquistas',
		description: 'Acompanhe suas missões e desbloqueie conquistas!',
		icon: Trophy,
		color: 'from-yellow-400 to-yellow-600',
		hoverColor: 'hover:from-yellow-500 hover:to-yellow-700',
	},
	{
		path: '/ranking',
		title: 'Ranking',
		description: 'Veja os melhores jogadores e suas pontuações!',
		icon: Users,
		color: 'from-yellow-400 to-yellow-600',
		hoverColor: 'hover:from-yellow-500 hover:to-yellow-700',
	},
	{
		path: '/contatos',
		title: 'Nossa Equipe',
		description: 'Conheça os estudantes que criaram este projeto!',
		icon: Users,
		color: 'from-pink-400 to-pink-600',
		hoverColor: 'hover:from-pink-500 hover:to-pink-700',
	},
];

export function HomePage() {
	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">🌳</div>
				<div className="absolute top-40 right-20 text-4xl opacity-20 animate-bounce">🦀</div>
				<div className="absolute bottom-32 left-20 text-5xl opacity-20">🦢</div>
				<div className="absolute bottom-20 right-10 text-3xl opacity-20 animate-pulse">🐟</div>
				<div className="absolute top-60 left-1/2 text-4xl opacity-20">🦩</div>
			</div>

			{/* Water Wave Animation */}
			<div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-200 to-transparent opacity-30">
				<svg
					className="absolute bottom-0 w-full h-16"
					viewBox="0 0 1200 120"
					preserveAspectRatio="none"
				>
					<path
						d="M0,60 C300,100 600,20 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
						className="fill-blue-300 opacity-60 animate-pulse"
					/>
				</svg>
			</div>

			<div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<div className="flex items-center justify-center mb-6">
						<div className="bg-white rounded-full p-4 shadow-lg mr-4">
							<TreePine className="h-12 w-12 text-green-600" />
						</div>
						<h1 className="text-5xl md:text-6xl font-bold text-gray-800">
							Mundo dos
							<span className="text-green-600 block">Mangues</span>
						</h1>
					</div>

					<p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
						Bem-vindos ao lugar mais incrível da natureza! Os mangues são como cidades
						aquáticas onde muitos animais e plantas vivem juntos. Vamos explorar este
						mundo mágico! 🌊
					</p>

					<div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
						<div className="flex items-center">
							<Waves className="h-5 w-5 mr-2 text-blue-500" />
							<span>Água Salgada</span>
						</div>
						<div className="flex items-center">
							<Fish className="h-5 w-5 mr-2 text-orange-500" />
							<span>Muitos Animais</span>
						</div>
						<div className="flex items-center">
							<Leaf className="h-5 w-5 mr-2 text-green-500" />
							<span>Plantas Especiais</span>
						</div>
					</div>
				</div>

				{/* Navigation Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
					{navigationCards.map((card) => {
						const Icon = card.icon;
						return (
							<Link
								key={card.path}
								to={card.path}
								className={`group relative overflow-hidden bg-gradient-to-r ${card.color} ${card.hoverColor} 
                           rounded-3xl p-6 md:p-8 text-white shadow-2xl transform transition-all duration-300 
                           hover:scale-105 hover:shadow-3xl min-h-[200px]`}
							>
								<div className="relative z-10">
									<div className="flex items-start justify-between mb-6">
										<div className="bg-white bg-opacity-20 rounded-2xl p-4 group-hover:bg-opacity-30 transition-all duration-300">
											<Icon className="h-10 w-10" />
										</div>
										<div className="text-right opacity-80 group-hover:opacity-100 transition-opacity">
											<div className="text-sm font-medium">Clique para</div>
											<div className="text-xs">explorar →</div>
										</div>
									</div>

									<h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-yellow-200 transition-colors">
										{card.title}
									</h3>
									<p className="text-base md:text-lg opacity-90 leading-relaxed">
										{card.description}
									</p>
								</div>

								{/* Decorative Background Elements */}
								<div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 group-hover:opacity-20 transition-opacity">
									<Icon className="h-32 w-32" />
								</div>
								<div className="absolute bottom-0 left-0 transform -translate-x-4 translate-y-4 opacity-5 group-hover:opacity-10 transition-opacity">
									<Icon className="h-24 w-24" />
								</div>
							</Link>
						);
					})}
				</div>

				{/* Fun Facts Section */}
				<div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
					<h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
						🌟 Você Sabia?
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="text-center p-6 bg-green-50 rounded-xl">
							<div className="text-4xl mb-4">🦀</div>
							<h3 className="font-bold text-lg mb-2 text-green-700">
								Super Caranguejos!
							</h3>
							<p className="text-gray-700">
								Os caranguejos fazem buracos na lama que ajudam o mangue a respirar!
							</p>
						</div>

						<div className="text-center p-6 bg-blue-50 rounded-xl">
							<div className="text-4xl mb-4">🌳</div>
							<h3 className="font-bold text-lg mb-2 text-blue-700">
								Árvores Filtros!
							</h3>
							<p className="text-gray-700">
								As árvores do mangue conseguem tirar o sal da água do mar!
							</p>
						</div>

						<div className="text-center p-6 bg-purple-50 rounded-xl">
							<div className="text-4xl mb-4">🐟</div>
							<h3 className="font-bold text-lg mb-2 text-purple-700">
								Berçário do Mar!
							</h3>
							<p className="text-gray-700">
								Muitos peixes nascem no mangue antes de ir para o oceano!
							</p>
						</div>
					</div>
				</div>

				{/* Call to Action */}
				<div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-white">
					<h2 className="text-3xl font-bold mb-4">Pronto para a Aventura? 🚀</h2>
					<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
						Escolha uma das seções acima e comece a descobrir os segredos dos mangues!
						Cada clique é uma nova descoberta!
					</p>

					<div className="flex flex-wrap justify-center gap-4">
						<span className="bg-white bg-opacity-20 px-6 py-2 rounded-full text-lg font-medium">
							🎓 Aprenda
						</span>
						<span className="bg-white bg-opacity-20 px-6 py-2 rounded-full text-lg font-medium">
							🎮 Jogue
						</span>
						<span className="bg-white bg-opacity-20 px-6 py-2 rounded-full text-lg font-medium">
							🌱 Proteja
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}