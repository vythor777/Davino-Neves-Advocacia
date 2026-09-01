import { NextResponse } from 'next/server';

function limparNumeroProcesso(numero: string): string {
  if (!numero) return '';
  return numero.replace(/\D/g, '').trim();
}

function identificarTribunal(numeroLimpo: string): string {
  if (numeroLimpo.length !== 20) return 'tjsp';
  const j = numeroLimpo.substring(13, 14);
  const tr = numeroLimpo.substring(14, 16);

  if (j === '8') {
    const tribunaisEstaduais: Record<string, string> = {
      '01': 'tjac', '02': 'tjal', '03': 'tjap', '04': 'tjam', '05': 'tjba',
      '06': 'tjce', '07': 'tjdft', '08': 'tjes', '09': 'tjgo', '10': 'tjma',
      '11': 'tjmt', '12': 'tjms', '13': 'tjmg', '14': 'tjpa', '15': 'tjpb',
      '16': 'tjpr', '17': 'tjpe', '18': 'tjpi', '19': 'tjrj', '20': 'tjrn',
      '21': 'tjrs', '22': 'tjro', '23': 'tjrr', '24': 'tjsc', '25': 'tjse',
      '26': 'tjsp', '27': 'tjto',
    };
    return tribunaisEstaduais[tr] || 'tjsp';
  }
  if (j === '4') return `trf${parseInt(tr, 10)}`;
  if (j === '5') return `trt${parseInt(tr, 10)}`;
  if (j === '3') return 'stj';
  if (j === '1') return 'stf';

  return 'tjsp';
}

function gerarProcessoSimulado(numeroProcesso: string, tribunal?: string) {
  const numeroLimpo = limparNumeroProcesso(numeroProcesso) || '10234567820248260100';
  const siglaTribunal = (tribunal?.toLowerCase() || identificarTribunal(numeroLimpo)).toUpperCase();

  const formatado =
    numeroLimpo.length === 20
      ? `${numeroLimpo.slice(0, 7)}-${numeroLimpo.slice(7, 9)}.${numeroLimpo.slice(9, 13)}.${numeroLimpo.slice(13, 14)}.${numeroLimpo.slice(14, 16)}.${numeroLimpo.slice(16, 20)}`
      : numeroLimpo;

  const dataHoje = new Date();
  const dataAjuizamento = new Date(dataHoje.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
  const dataMov1 = new Date(dataHoje.getTime() - 179 * 24 * 60 * 60 * 1000).toISOString();
  const dataMov2 = new Date(dataHoje.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();
  const dataMov3 = new Date(dataHoje.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const dataMov4 = new Date(dataHoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

  return {
    sucesso: true,
    simulado: true,
    tribunal: siglaTribunal,
    numeroProcesso: formatado,
    classe: 'Procedimento Comum Cível',
    orgaoJulgador: `3ª Vara Cível da Comarca Central - ${siglaTribunal}`,
    dataAjuizamento: dataAjuizamento,
    grau: 'G1',
    nivelSigilo: 0,
    assuntos: [
      'Direito Civil / Obrigações / Inadimplemento',
      'Indenização por Dano Material e Moral',
      'Contratos Bancários / Prestação de Serviços',
    ],
    movimentos: [
      {
        codigo: 60,
        nome: 'Expedição de Termo de Conclusão para Decisão/Despacho',
        dataHora: dataMov4,
        complementos: [
          {
            codigo: 1,
            nome: 'tipo_de_conclusao',
            descricao: 'Conclusos para Despacho com urgência',
          },
        ],
      },
      {
        codigo: 85,
        nome: 'Juntada de Petição de Manifestação sobre a Contestação',
        dataHora: dataMov3,
        complementos: [
          {
            codigo: 2,
            nome: 'tipo_de_peticao',
            descricao: 'Réplica à Contestação e Juntada de Provas',
          },
        ],
      },
      {
        codigo: 110,
        nome: 'Juntada de Contestação com Documentos de Defesa',
        dataHora: dataMov2,
        complementos: [
          {
            codigo: 3,
            nome: 'tipo_de_documento',
            descricao: 'Contestação e Procuração Ad Judicia',
          },
        ],
      },
      {
        codigo: 26,
        nome: 'Distribuição do Processo por Sorteio',
        dataHora: dataMov1,
        complementos: [
          {
            codigo: 4,
            nome: 'tipo_de_distribuicao',
            descricao: 'Distribuição Ordinária Automática',
          },
        ],
      },
    ],
    dadosCompletos: {
      numeroProcesso: formatado,
      classe: { codigo: 7, nome: 'Procedimento Comum Cível' },
      sistema: { codigo: 1, nome: 'PJe / DataJud Integrado' },
      formato: { codigo: 1, nome: 'Eletrônico' },
      tribunal: siglaTribunal,
      dataHoraUltimaAtualizacao: new Date().toISOString(),
    },
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  let numeroLimpo = '';
  let siglaTribunal = 'tjsp';

  try {
    const { numero } = await params;
    numeroLimpo = limparNumeroProcesso(numero);

    if (!numeroLimpo || numeroLimpo.length < 15) {
      return NextResponse.json(
        { message: 'Número de processo inválido. Padrão CNJ com 20 dígitos numéricos.' },
        { status: 400 }
      );
    }

    siglaTribunal = identificarTribunal(numeroLimpo);
    const rawKey =
      process.env.DATAJUD_API_KEY ||
      'cDZHYzlZa0JadVREZDJCendQbXZ6YVpmOjE1MDExNWVlLTczYjctNGNiZi1iOWJhLTI4YjQ4ZDRjNzM2NQ==';
    const baseUrl =
      process.env.DATAJUD_API_URL || 'https://api-publica.datajud.cnj.jus.br';

    const authHeader = rawKey.trim().startsWith('APIKey ')
      ? rawKey.trim()
      : `APIKey ${rawKey.trim()}`;

    const endpoint = `${baseUrl}/api_publica_${siglaTribunal}/_search`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        query: {
          match: {
            numeroProcesso: numeroLimpo,
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[DataJud Frontend API Error] Status: ${response.status} | Tribunal: ${siglaTribunal} | Resposta CNJ: ${errorText}`
      );
      return NextResponse.json(
        {
          message: `Erro ao consultar processo no tribunal ${siglaTribunal.toUpperCase()} (HTTP ${response.status}): ${errorText}`,
          tribunal: siglaTribunal,
          endpoint,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const hits = data?.hits?.hits || [];

    if (hits.length === 0) {
      return NextResponse.json(
        { message: `Processo não localizado no tribunal ${siglaTribunal.toUpperCase()}.` },
        { status: 404 }
      );
    }

    const processoData = hits[0]._source;

    return NextResponse.json({
      sucesso: true,
      tribunal: siglaTribunal.toUpperCase(),
      numeroProcesso: processoData.numeroProcesso,
      classe: processoData.classe?.nome || 'Procedimento Comum Cível',
      orgaoJulgador:
        processoData.orgaoJulgador?.nome || `Vara Cível - ${siglaTribunal.toUpperCase()}`,
      dataAjuizamento: processoData.dataAjuizamento || new Date().toISOString(),
      grau: processoData.grau || 'G1',
      nivelSigilo: processoData.nivelSigilo ?? 0,
      assuntos: processoData.assuntos?.map((a: any) => a.nome) || ['Direito Civil'],
      movimentos: (processoData.movimentos || []).map((m: any) => ({
        codigo: m.codigo,
        nome: m.nome,
        dataHora: m.dataHora,
        complementos: m.complementosTabelados || [],
      })),
      dadosCompletos: processoData,
    });
  } catch (error: any) {
    console.error('[DataJud Frontend API Exception]:', error);
    return NextResponse.json(
      { message: `Erro interno ao processar a consulta do processo: ${error?.message || 'Erro de conexão/timeout.'}` },
      { status: 500 }
    );
  }
}
