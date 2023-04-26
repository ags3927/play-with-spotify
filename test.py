import numpy as np
import pandas as pd
import json
import requests

def add_country_id():
    data = pd.read_csv('new_data.csv', low_memory=False)
    topo = json.load(open('world_countries.json'))
    
    countries = topo['features']
    country_list = []
    country_to_id_map = {}
    
    for country in countries:
        country_list.append(country['properties']['name'])
        country_to_id_map[country['properties']['name']] = country['id']
    
    track_country_list = data['Country'].tolist()
    track_country_id_list = []
    
    
    for track_country in track_country_list:
        track_country_id_list.append(country_to_id_map[track_country])
    
    data['Country ID'] = track_country_id_list
    
    data.to_csv('data_final.csv')

def get_columns():
    df = pd.read_csv('data_final.csv')
    
    cols = df.columns
    
    print(cols)

def get_access_token():
    url = "https://accounts.spotify.com/api/token"
    
    client_id = '3e9cd073ff5a4668a3b6ed5c61476dd3'
    client_secret = '89ec56a2a8214360878b7d7294ed94ed'
    
    headers = {
        'Authorization': 'Basic ' + client_id + ':' + client_secret
    }
    
    form = {
        'grant_type': 'client_credentials'
    }
    json = True
    
    r = requests.post(url, headers=headers)

    print(r)
    

def get_genre():
    df = pd.read_csv('data_final.csv')
    uris = df['Uri']
    
    request_url = 'https://api.spotify.com/v1/tracks/'
    
    for uri in uris:
        id = uri.split(':')[2]
        
        res = requests.get(request_url + '11dFghVXANMlKmJXsNCbNl', headers={
            'Authorization': 'Basic eeb2ab9adcdf406e966a1261d4cc8cf8'
        })
        
        data = res.json()
        
        print(data)
        
        break


def main():
    get_access_token()

    
if __name__ == "__main__":
    main()