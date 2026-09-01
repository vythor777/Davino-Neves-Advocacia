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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  try {
    const { numero } = await params;
    const numeroLimpo = limparNumeroProcesso(numero);

    if (!numeroLimpo || numeroLimpo.length < 15) {
      return NextResponse.json(
        { message: 'Número de processo inválido. Padrão CNJ com 20 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const siglaTribunal = identificarTribunal(numeroLimpo);
    const apiKey =
      process.env.DATAJUD_API_KEY ||
      'cDZHYzlZa0JadVREZDJCendQbXZ6YVpmOjE1MDExNWVlLTczYjctNGNiZi1iOWJhLTI4YjQ4ZDRjNzM2NQ==';
    const baseUrl =
      process.env.DATAJUD_API_URL || 'https://api-publica.datajud.cnj.jus.br';

    const endpoint = `${baseUrl}/api_publica_${siglaTribunal}/_search`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `APIKey ${apiKey}`,
      },
      body: JSON.stringify({
        query: {
          match: {
            numeroProcesso: numeroLimpo,
          },
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: `Erro ao consultar processo no tribunal ${siglaTribunal.toUpperCase()}.` },
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
      classe: processoData.classe?.nome,
      orgaoJulgador: processoData.orgaoJulgador?.nome,
      dataAjuizamento: processoData.dataAjuizamento,
      grau: processoData.grau,
      nivelSigilo: processoData.nivelSigilo,
      assuntos: processoData.assuntos?.map((a: any) => a.nome) || [],
      movimentos: (processoData.movimentos || []).map((m: any) => ({
        codigo: m.codigo,
        nome: m.nome,
        dataHora: m.dataHora,
        complementos: m.complementosTabelados || [],
      })),
      dadosCompletos: processoData,
    });
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao processar a consulta do processo.' },
      { status: 500 }
    );
  }
}
