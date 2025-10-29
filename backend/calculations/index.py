import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save and retrieve calculation history from database
    Args: event - dict with httpMethod, body (expression, result for POST)
    Returns: HTTP response with saved calculations or confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    
    if method == 'GET':
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT id, expression, result, created_at FROM calculations ORDER BY created_at DESC LIMIT 50')
            calculations = cur.fetchall()
            
            for calc in calculations:
                calc['created_at'] = calc['created_at'].isoformat()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'calculations': calculations})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        expression = body_data.get('expression', '')
        result = body_data.get('result', '')
        
        if not expression or not result:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Expression and result required'})
            }
        
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO calculations (expression, result) VALUES (%s, %s) RETURNING id',
                (expression, result)
            )
            calc_id = cur.fetchone()[0]
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'id': calc_id, 'message': 'Calculation saved'})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
