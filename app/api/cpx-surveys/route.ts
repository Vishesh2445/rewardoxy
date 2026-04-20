import { NextRequest, NextResponse } from 'next/server';

interface CPXSurvey {
  id: string;
  title: string;
  description?: string;
  reward: number;
  loi?: number;
  conversion_rate?: string;
  image_url?: string;
  click_url: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const CPX_SECURE_HASH = process.env.CPX_SECURE_HASH;

    if (!CPX_SECURE_HASH) {
      return NextResponse.json({
        success: true,
        surveys: [],
        total: 0,
      });
    }

    let surveys: CPXSurvey[] = [];
    surveys = await tryPrimaryEndpoint(user_id, CPX_SECURE_HASH);

    if (surveys.length === 0) {
      surveys = await tryAlternativeEndpoints(user_id, CPX_SECURE_HASH);
    }

    return NextResponse.json({
      success: true,
      surveys: surveys,
      total: surveys.length,
    });

  } catch (error) {
    return NextResponse.json({
      success: true,
      surveys: [],
      total: 0,
    });
  }
}

async function tryPrimaryEndpoint(user_id: string, secureHash: string): Promise<CPXSurvey[]> {
  try {
    const apiUrl = new URL('https://api.cpx-research.com/v1/widget_data');
    apiUrl.searchParams.append('app_id', '32037');
    apiUrl.searchParams.append('ext_user_id', user_id);
    apiUrl.searchParams.append('secure_hash', secureHash);
    apiUrl.searchParams.append('format', 'json');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const surveys = processCPXSurveys(data, user_id);

    if (surveys.length > 0) {
      return surveys;
    }
  } catch (error) {
    // Silent fail
  }

  return [];
}

async function tryAlternativeEndpoints(user_id: string, secureHash: string): Promise<CPXSurvey[]> {
  const endpoints = [
    {
      url: 'https://api.cpx-research.com/v2/surveys',
      params: { app_id: '32037', ext_user_id: user_id, secure_hash: secureHash }
    },
    {
      url: 'https://surveys.cpx-research.com/api/surveys',
      params: { app_id: '32037', user_id: user_id, hash: secureHash }
    },
    {
      url: 'https://www.cpx-research.com/api/get-surveys',
      params: { app_id: '32037', ext_user_id: user_id, secure_hash: secureHash }
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const apiUrl = new URL(endpoint.url);
      Object.entries(endpoint.params).forEach(([key, value]) => {
        apiUrl.searchParams.append(key, String(value));
      });

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        const surveys = processCPXSurveys(data, user_id);

        if (surveys.length > 0) {
          return surveys;
        }
      }
    } catch (error) {
      // Silent fail, try next endpoint
    }
  }

  return [];
}

function processCPXSurveys(data: any, user_id: string): CPXSurvey[] {
  const surveys: CPXSurvey[] = [];

  try {
    let surveyArray: any[] = [];

    if (data.surveys && Array.isArray(data.surveys)) {
      surveyArray = data.surveys;
    } else if (data.data && Array.isArray(data.data)) {
      surveyArray = data.data;
    } else if (Array.isArray(data)) {
      surveyArray = data;
    }

    for (const survey of surveyArray) {
      if (!survey || !survey.id) continue;

      const processedSurvey: CPXSurvey = {
        id: survey.id || survey.survey_id || survey.sid,
        title: survey.title || survey.name || 'Survey',
        description: survey.description,
        reward: Math.max(parseFloat(survey.reward || survey.cpi || survey.payout || '0'), 0) / 1000,
        loi: survey.loi || survey.time_remaining,
        conversion_rate: survey.conversion_rate,
        image_url: survey.image_url || survey.image || survey.thumbnail,
        click_url: generateCPXSurveyUrl(survey.id, user_id),
      };

      surveys.push(processedSurvey);
    }
  } catch (error) {
    // Silent fail
  }

  return surveys;
}

function generateCPXSurveyUrl(surveyId: string, userId: string): string {
  return `https://offers.cpx-research.com/index.php?app_id=32037&ext_user_id=${userId}&survey_id=${surveyId}`;
}
