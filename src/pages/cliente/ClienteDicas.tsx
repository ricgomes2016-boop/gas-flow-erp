import { useState } from "react";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ChefHat, 
  AlertTriangle, 
  CheckCircle2,
  Flame,
  Wind,
  Phone,
  BookOpen,
  Clock,
  Users
} from "lucide-react";

const safetyTips = [
  {
    id: "1",
    title: "Verificação do Botijão",
    icon: CheckCircle2,
    tips: [
      "Verifique sempre o lacre de segurança antes de aceitar a entrega",
      "Confira se o botijão está dentro da validade (gravada no corpo)",
      "Observe se há amassados ou ferrugem excessiva",
      "O peso correto do P13 cheio é aproximadamente 29kg"
    ]
  },
  {
    id: "2",
    title: "Instalação Segura",
    icon: Flame,
    tips: [
      "Mantenha o botijão sempre em pé, nunca deitado",
      "Instale em área ventilada, nunca em locais fechados",
      "Use mangueira e registro dentro da validade",
      "Não aproxime de fontes de calor ou faíscas"
    ]
  },
  {
    id: "3",
    title: "Em Caso de Vazamento",
    icon: AlertTriangle,
    tips: [
      "NÃO acenda luzes nem use interruptores elétricos",
      "Abra portas e janelas imediatamente",
      "Feche o registro do botijão se possível",
      "Saia do local e ligue para o Corpo de Bombeiros (193)"
    ]
  },
  {
    id: "4",
    title: "Ventilação",
    icon: Wind,
    tips: [
      "Mantenha sempre uma entrada de ar próxima ao botijão",
      "O GLP é mais pesado que o ar - se acumula no chão",
      "Não instale em porões ou áreas subterrâneas",
      "Cozinhas devem ter ventilação permanente"
    ]
  }
];

const recipes = [
  {
    id: "1",
    title: "Arroz Soltinho Perfeito",
    time: "25 min",
    servings: "4 porções",
    difficulty: "Fácil",
    image: "🍚",
    ingredients: [
      "2 xícaras de arroz",
      "4 xícaras de água quente",
      "2 dentes de alho",
      "1 colher de óleo",
      "Sal a gosto"
    ],
    steps: [
      "Lave o arroz até a água sair limpa",
      "Aqueça o óleo e doure o alho",
      "Adicione o arroz e refogue por 2 minutos",
      "Acrescente a água quente e o sal",
      "Tampe e cozinhe em fogo baixo por 20 minutos"
    ]
  },
  {
    id: "2",
    title: "Feijão Cremoso",
    time: "1h 30min",
    servings: "6 porções",
    difficulty: "Médio",
    image: "🫘",
    ingredients: [
      "500g de feijão carioca",
      "1 linguiça calabresa",
      "1 cebola",
      "3 dentes de alho",
      "Louro, sal e pimenta"
    ],
    steps: [
      "Deixe o feijão de molho por 8 horas",
      "Cozinhe na pressão por 30 minutos",
      "Refogue alho, cebola e calabresa",
      "Adicione o feijão e temperos",
      "Cozinhe por mais 20 minutos"
    ]
  },
  {
    id: "3",
    title: "Omelete Rápida",
    time: "10 min",
    servings: "1 porção",
    difficulty: "Fácil",
    image: "🍳",
    ingredients: [
      "2 ovos",
      "2 colheres de leite",
      "Queijo ralado",
      "Sal e pimenta",
      "Manteiga"
    ],
    steps: [
      "Bata os ovos com leite, sal e pimenta",
      "Aqueça manteiga na frigideira",
      "Despeje a mistura de ovos",
      "Quando firmar embaixo, adicione o queijo",
      "Dobre ao meio e sirva"
    ]
  },
  {
    id: "4",
    title: "Macarrão Alho e Óleo",
    time: "20 min",
    servings: "4 porções",
    difficulty: "Fácil",
    image: "🍝",
    ingredients: [
      "500g de espaguete",
      "6 dentes de alho",
      "1/2 xícara de azeite",
      "Pimenta calabresa",
      "Salsinha e sal"
    ],
    steps: [
      "Cozinhe o macarrão al dente",
      "Fatie o alho fino e doure no azeite",
      "Adicione pimenta calabresa",
      "Misture o macarrão escorrido",
      "Finalize com salsinha"
    ]
  }
];

const emergencyContacts = [
  { name: "Corpo de Bombeiros", number: "193" },
  { name: "SAMU", number: "192" },
  { name: "Defesa Civil", number: "199" },
  { name: "Polícia Militar", number: "190" },
];

export default function ClienteDicas() {
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null);

  return (
    <ClienteLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dicas e Receitas</h1>

        <Tabs defaultValue="seguranca" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="seguranca" className="flex-1 gap-1">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="receitas" className="flex-1 gap-1">
              <ChefHat className="h-4 w-4" />
              Receitas
            </TabsTrigger>
          </TabsList>

          {/* Safety Tips Tab */}
          <TabsContent value="seguranca" className="space-y-4 mt-4">
            {/* Emergency Banner */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700 mb-3">
                  <Phone className="h-5 w-5" />
                  <span className="font-semibold">Telefones de Emergência</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyContacts.map(contact => (
                    <a
                      key={contact.number}
                      href={`tel:${contact.number}`}
                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-red-200"
                    >
                      <span className="text-sm">{contact.name}</span>
                      <Badge variant="destructive">{contact.number}</Badge>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            {safetyTips.map(section => (
              <Card key={section.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="receitas" className="space-y-4 mt-4">
            {selectedRecipe ? (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="text-primary text-sm flex items-center gap-1"
                >
                  ← Voltar para receitas
                </button>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-3xl">
                        {selectedRecipe.image}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedRecipe.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedRecipe.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {selectedRecipe.servings}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="secondary" className="mb-4">
                      {selectedRecipe.difficulty}
                    </Badge>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Ingredientes
                        </h3>
                        <ul className="space-y-1">
                          {selectedRecipe.ingredients.map((ing, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          Modo de Preparo
                        </h3>
                        <ol className="space-y-2">
                          {selectedRecipe.steps.map((step, i) => (
                            <li key={i} className="text-sm flex gap-3">
                              <Badge className="h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-xs">
                                {i + 1}
                              </Badge>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recipes.map(recipe => (
                  <Card 
                    key={recipe.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <CardContent className="p-3">
                      <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center text-4xl mb-2">
                        {recipe.image}
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.time}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClienteLayout>
  );
}
