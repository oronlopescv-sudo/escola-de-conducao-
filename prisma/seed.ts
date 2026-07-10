import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const modulos = [
  { numero: 1, titulo: "Regras gerais do Código de Estrada", descricao: "Via pública, faixa de rodagem, eixo da via e sentido de trânsito." },
  { numero: 2, titulo: "Classificação dos Veículos", descricao: "Ligeiros, pesados, motociclos, ciclomotores, velocípedes e agrícolas." },
  { numero: 3, titulo: "Sinalização de Trânsito", descricao: "Sinais de perigo, proibição, obrigação e informação." },
  { numero: 4, titulo: "Lei do Álcool", descricao: "Taxas legais, contraordenações e efeitos do álcool na condução." },
  { numero: 5, titulo: "Sinais Sonoros (Buzina)", descricao: "Quando e como usar os sinais sonoros." },
  { numero: 6, titulo: "Sinais dos Agentes Reguladores", descricao: "Sinais de paragem e de avanço dos agentes de trânsito." },
  { numero: 7, titulo: "Sinais Luminosos (Semáforos)", descricao: "Sistema tricolor, setas e luz amarela intermitente." },
  { numero: 8, titulo: "Hierarquia dos Sinais de Trânsito", descricao: "Agente > temporários > luminosos > verticais > marcas > regras gerais." },
  { numero: 9, titulo: "Marcas Rodoviárias", descricao: "Linhas contínuas, descontínuas, mistas, raias e linhas amarelas." },
  { numero: 10, titulo: "Sinal de Pré-Sinalização (Triângulo)", descricao: "Obrigatoriedade e modo de colocação do triângulo." },
  { numero: 11, titulo: "Paragem e Estacionamento Proibidos", descricao: "Distâncias e locais onde é proibido parar ou estacionar." },
  { numero: 12, titulo: "Inversão de Sentido de Marcha e Marcha Atrás", descricao: "Locais permitidos e proibidos para estas manobras." },
  { numero: 13, titulo: "Mudança de Direção", descricao: "Em vias de dois sentidos e de sentido único." },
  { numero: 14, titulo: "Ultrapassagem", descricao: "Regras, cuidados e locais onde é proibido ultrapassar." },
  { numero: 15, titulo: "Iluminação nos Veículos", descricao: "Mínimos, médios, máximos e luzes à retaguarda." },
  { numero: 16, titulo: "Visibilidade Reduzida e Segurança Rodoviária", descricao: "Distância de segurança, condução defensiva e fatores de risco." },
  { numero: 17, titulo: "Ordem de Passagem nos Cruzamentos", descricao: "Regra da direita, veículos de socorro e cruzamentos com sinal." },
  { numero: 18, titulo: "Cruzamento em Vias Estreitas ou Obstruídas", descricao: "Quem cede passagem e quem recua." },
  { numero: 19, titulo: "Autoestrada e Vias Reservadas", descricao: "Proibições, entrada e saída das autoestradas." },
  { numero: 20, titulo: "Quadro de Velocidade Máxima", descricao: "Limites por tipo de veículo e tipo de via." },
  { numero: 21, titulo: "Transporte de Pessoas e Carga", descricao: "Cinto de segurança, crianças e disposição da carga." },
  { numero: 22, titulo: "Contraordenações Grave e Muito Grave", descricao: "Classificação, coimas e inibição de conduzir." },
  { numero: 23, titulo: "Categorias e Carta de Condução", descricao: "Categorias A a D+E, subcategorias e carta provisória." },
];

// Questões derivadas do Manual de Código CV e do Decreto-Legislativo 4/2005
const questoes: {
  m: number; e: string; a: string; b: string; c?: string; d?: string; ok: string; x?: string;
}[] = [
  { m: 4, e: "A partir de que taxa de álcool no sangue se considera que o condutor está sob influência do álcool?", a: "0,2 g/l", b: "0,5 g/l", c: "0,8 g/l", d: "1,2 g/l", ok: "B", x: "Igual ou superior a 0,5 g/l no sangue (ou 0,4 mg/l no ar expirado)." },
  { m: 4, e: "Conduzir com taxa de álcool no sangue igual ou superior a 1,2 g/l é:", a: "Contraordenação leve", b: "Contraordenação grave", c: "Contraordenação muito grave", d: "Crime, punido com pena de prisão", ok: "D", x: "A partir de 1,2 g/l é crime." },
  { m: 4, e: "A condução sob influência do álcool (entre 0,5 e 1,2 g/l) é uma contraordenação:", a: "Leve", b: "Grave", c: "Muito grave", d: "Não é contraordenação", ok: "C" },
  { m: 10, e: "O sinal de pré-sinalização de perigo (triângulo) deve ser colocado a uma distância não inferior a:", a: "10 metros", b: "20 metros", c: "30 metros", d: "50 metros", ok: "C", x: "Mínimo 30 metros da retaguarda do veículo, visível a pelo menos 100 metros." },
  { m: 10, e: "O triângulo deve ficar bem visível a uma distância mínima de:", a: "30 metros", b: "50 metros", c: "100 metros", d: "150 metros", ok: "C" },
  { m: 11, e: "É proibido parar ou estacionar a menos de quantos metros dos cruzamentos e entroncamentos?", a: "3 metros", b: "5 metros", c: "10 metros", d: "15 metros", ok: "B" },
  { m: 11, e: "É proibido parar ou estacionar a menos de quantos metros dos sinais luminosos à entrada de um cruzamento?", a: "5 metros", b: "10 metros", c: "15 metros", d: "20 metros", ok: "D" },
  { m: 11, e: "É proibido parar ou estacionar a menos de quantos metros dos sinais de paragem de autocarros?", a: "5 metros", b: "10 metros", c: "15 metros", d: "20 metros", ok: "C" },
  { m: 11, e: "É proibido estacionar a menos de quantos metros das passagens de nível?", a: "5 metros", b: "10 metros", c: "15 metros", d: "20 metros", ok: "B" },
  { m: 11, e: "Fora das localidades, é proibido parar ou estacionar a menos de quantos metros das curvas ou lombas de visibilidade reduzida?", a: "20 metros", b: "30 metros", c: "50 metros", d: "100 metros", ok: "C" },
  { m: 16, e: "Considera-se visibilidade reduzida quando o condutor não avista a faixa de rodagem em toda a largura numa extensão de pelo menos:", a: "30 metros", b: "50 metros", c: "100 metros", d: "150 metros", ok: "B" },
  { m: 15, e: "A luz de cruzamento (médios) deve iluminar o solo numa distância de:", a: "20 metros", b: "30 metros", c: "50 metros", d: "100 metros", ok: "B" },
  { m: 15, e: "A luz de estrada (máximos) deve projetar-se a uma distância de pelo menos:", a: "30 metros", b: "50 metros", c: "100 metros", d: "200 metros", ok: "C" },
  { m: 15, e: "A utilização dos máximos de modo a provocar encandeamento é contraordenação:", a: "Leve", b: "Grave", c: "Muito grave", d: "Não é infração", ok: "C" },
  { m: 20, e: "Dentro das localidades, a velocidade máxima para automóveis ligeiros de passageiros sem reboque é:", a: "40 km/h", b: "50 km/h", c: "60 km/h", d: "70 km/h", ok: "B", x: "O novo Código fixou 50 km/h dentro das localidades." },
  { m: 20, e: "Na autoestrada, a velocidade máxima para um automóvel ligeiro de passageiros sem reboque é:", a: "100 km/h", b: "110 km/h", c: "120 km/h", d: "130 km/h", ok: "C" },
  { m: 19, e: "Nas autoestradas, os condutores não podem transitar a velocidade instantânea inferior a:", a: "30 km/h", b: "40 km/h", c: "50 km/h", d: "60 km/h", ok: "B" },
  { m: 19, e: "Nas autoestradas é proibido o trânsito de veículos insuscetíveis de atingir em patamar a velocidade de:", a: "40 km/h", b: "50 km/h", c: "60 km/h", d: "80 km/h", ok: "C" },
  { m: 19, e: "Nas autoestradas com três ou mais vias no mesmo sentido, os pesados de mercadorias com comprimento superior a 7 metros:", a: "Podem usar qualquer via", b: "Só podem usar as duas vias mais à direita", c: "Só podem usar a via mais à esquerda", d: "Não podem circular", ok: "B" },
  { m: 21, e: "É proibido transportar crianças no banco da frente com idade inferior a:", a: "7 anos", b: "10 anos", c: "12 anos ou 150 cm de altura", d: "14 anos", ok: "C", x: "O novo Código subiu de 10 para 12 anos, conforme convenção internacional." },
  { m: 21, e: "Nos motociclos e ciclomotores é proibido o transporte de passageiros de idade inferior a:", a: "5 anos", b: "7 anos", c: "10 anos", d: "12 anos", ok: "B" },
  { m: 21, e: "Na disposição da carga, a altura máxima a contar do solo é:", a: "3 metros", b: "3,5 metros", c: "4 metros", d: "4,5 metros", ok: "C" },
  { m: 23, e: "A carta de condução provisória converte-se em definitiva ao fim de:", a: "1 ano", b: "2 anos", c: "3 anos", d: "5 anos", ok: "C", x: "3 anos sem procedimento por crime ou contraordenação com inibição de conduzir." },
  { m: 23, e: "A idade mínima para obter carta de condução da categoria B é:", a: "16 anos", b: "17 anos", c: "18 anos", d: "21 anos", ok: "C" },
  { m: 23, e: "A idade mínima para as subcategorias A1 e B1 é:", a: "14 anos", b: "16 anos", c: "18 anos", d: "21 anos", ok: "B" },
  { m: 23, e: "Para obter carta das categorias C e D é necessário já possuir habilitação da categoria:", a: "A", b: "B", c: "F", d: "Nenhuma", ok: "B" },
  { m: 22, e: "A sanção de inibição de conduzir para contraordenações muito graves tem duração de:", a: "1 mês a 1 ano", b: "2 meses a 2 anos", c: "6 meses a 3 anos", d: "1 a 6 anos", ok: "B" },
  { m: 22, e: "O desrespeito da obrigação de parar imposta pela luz vermelha é contraordenação:", a: "Leve", b: "Grave", c: "Muito grave", d: "Crime", ok: "C" },
  { m: 17, e: "Nos cruzamentos sem sinalização, o condutor deve ceder passagem aos veículos que se apresentem:", a: "Pela esquerda", b: "Pela direita", c: "Em maior velocidade", d: "De maior dimensão", ok: "B" },
  { m: 17, e: "Ao entrar numa rotunda, o condutor deve:", a: "Avançar sempre primeiro", b: "Ceder passagem aos veículos que nela circulam", c: "Buzinar e avançar", d: "Ceder apenas aos pesados", ok: "B" },
  { m: 17, e: "Todos os veículos que saem de uma passagem de nível:", a: "Devem ceder passagem", b: "Têm prioridade, mesmo perante ambulâncias", c: "Cedem só aos pesados", d: "Cedem só de noite", ok: "B" },
  { m: 18, e: "Numa via estreita com acentuada inclinação, sendo impossível o cruzamento, deve ceder passagem o condutor do veículo que:", a: "Sobe", b: "Desce", c: "For mais pequeno", d: "Chegou primeiro", ok: "B" },
  { m: 14, e: "Regra geral, a ultrapassagem deve ser feita:", a: "Pela direita", b: "Pela esquerda", c: "Por qualquer lado", d: "Só em autoestrada", ok: "B" },
  { m: 14, e: "Ao notar que vai ser ultrapassado, o condutor deve:", a: "Aumentar a velocidade", b: "Travar bruscamente", c: "Desviar-se o mais possível para a direita sem aumentar a velocidade", d: "Buzinar", ok: "C" },
  { m: 12, e: "A marcha atrás só é permitida:", a: "Em autoestrada", b: "Como manobra auxiliar ou de recurso", c: "Nas lombas", d: "Nos túneis", ok: "B" },
  { m: 5, e: "De noite, dentro das localidades, os sinais sonoros:", a: "Podem ser usados livremente", b: "Devem ser substituídos por sinais luminosos", c: "São obrigatórios", d: "Só para chamar alguém", ok: "B" },
  { m: 8, e: "Na hierarquia da sinalização, prevalecem sobre todos os outros:", a: "Os sinais verticais", b: "As marcas rodoviárias", c: "As ordens dos agentes reguladores de trânsito", d: "Os semáforos", ok: "C" },
  { m: 9, e: "Uma linha amarela contínua junto ao passeio indica:", a: "Proibido estacionar mas permitido parar", b: "Proibido parar ou estacionar em toda a extensão", c: "Estacionamento pago", d: "Via reservada", ok: "B" },
  { m: 9, e: "Perante uma linha mista, o condutor que transita do lado da linha descontínua:", a: "Não pode pisar nem transpor", b: "Pode pisar ou transpor para efetuar manobra", c: "Deve parar", d: "Deve inverter marcha", ok: "B" },
  { m: 2, e: "Automóvel ligeiro é o veículo com peso bruto até:", a: "2500 kg", b: "3000 kg", c: "3500 kg", d: "4500 kg", ok: "C", x: "Até 3500 kg e lotação não superior a 9 lugares incluindo o condutor." },
  { m: 16, e: "Durante o exame de condução, a responsabilidade pelas infrações praticadas é:", a: "Do instrutor", b: "Do examinando", c: "Da escola", d: "Do examinador", ok: "B" },
  { m: 16, e: "Durante o ensino da condução, a responsabilidade pelas infrações é:", a: "Do instruendo", b: "Do instrutor, salvo desobediência às indicações", c: "Da DGTR", d: "De ninguém", ok: "B" },
];

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@autoescola.cv" },
    update: {},
    create: { nome: "Administrador", email: "admin@autoescola.cv", senha: hash, role: "ADMIN" },
  });

  const hashAluno = await bcrypt.hash("aluno123", 10);
  const alunoUser = await prisma.user.upsert({
    where: { email: "aluno@autoescola.cv" },
    update: {},
    create: {
      nome: "Aluno Demonstração",
      email: "aluno@autoescola.cv",
      senha: hashAluno,
      role: "ALUNO",
      aluno: { create: { categoria: "B", telefone: "9XX XX XX" } },
    },
  });

  for (const m of modulos) {
    await prisma.modulo.upsert({
      where: { numero: m.numero },
      update: { titulo: m.titulo, descricao: m.descricao },
      create: m,
    });
  }

  const count = await prisma.questao.count();
  if (count === 0) {
    for (const q of questoes) {
      const mod = await prisma.modulo.findUnique({ where: { numero: q.m } });
      await prisma.questao.create({
        data: {
          moduloId: mod?.id,
          enunciado: q.e,
          opcaoA: q.a,
          opcaoB: q.b,
          opcaoC: q.c,
          opcaoD: q.d,
          correta: q.ok,
          explicacao: q.x,
        },
      });
    }
  }

  console.log("Seed concluído.");
  console.log("Admin: admin@autoescola.cv / admin123");
  console.log("Aluno: aluno@autoescola.cv / aluno123");
}

main().finally(() => prisma.$disconnect());
