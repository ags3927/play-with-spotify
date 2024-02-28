import numpy as np
import pandas as pd
import json
import requests
from requests.structures import CaseInsensitiveDict
from tqdm import tqdm
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

TOKEN = "BQCPv83AUF-vSd_aZbyTvpv543wfRmeZlWSDlN9z1OBLHS8laFEbdMASJIouRmI5YHa4CF6-YfXMJVSA8cADr1swk16bYfonNht545APQ5-Yezb8drub"

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
    
    headers = CaseInsensitiveDict()
    headers["Content-Type"] = "application/x-www-form-urlencoded"
    
    client_id = '9ea1a0e8432c41179cc0f32f00dd5a94'
    client_secret = '02ee6e7442214ddf9d3d0b45ce13de95'
    
    data = "grant_type=client_credentials&client_id=9ea1a0e8432c41179cc0f32f00dd5a94&client_secret=02ee6e7442214ddf9d3d0b45ce13de95"
    
    resp = requests.post(url, headers=headers, data=data)

    return resp.json()
    

def get_genreDonut():
    response = get_access_token()
    token = response['access_token']
    # token = TOKEN
    
    df = pd.read_csv('data_final.csv')
    uris = df['Url Spotify']
    unique_uris = df['Url Spotify'].unique().tolist()
    
    request_url = 'https://api.spotify.com/v1/artists'
    
    headers = CaseInsensitiveDict()
    headers["Authorization"] = "Bearer " + token
    
    artist_ids = []
    
    for uri in unique_uris:
        id = uri.split('/')[-1]
        artist_ids.append(id)
    
    artists_data = []
    
    for i in tqdm(range(0, len(artist_ids), 50)):
        artist_id_batch = artist_ids[i:min(i+50,len(artist_ids))]
        # print(len(artist_id_batch))
        artist_id_batch_str = ','.join(artist_id_batch)
        res = requests.get(request_url, params={'ids': artist_id_batch_str}, headers=headers)
        json_data = res.json()
        artists_data = artists_data + json_data['artists']
    
    artist_id_to_genres = {}
    
    for artist_data in artists_data:
        artist_id_to_genres[artist_data['id']] = artist_data['genres']
        if (type(artist_data['genres']) == bool):
            artist_id_to_genres[artist_data['id']] = ['default']
        elif (len(artist_data['genres']) == 0):
            artist_id_to_genres[artist_data['id']] = ['default']
            
        
    # print(len(artist_id_to_genres))

    genres = []
    for uri in uris:
        genre = None
        id = uri.split('/')[-1]
        if id not in artist_id_to_genres.keys():
            print('wtf')
            genre = 'default'
        else:
            genre = artist_id_to_genres[id][0]
        genres.append(genre)
    
    df['Genre'] = genres
    df.to_csv('data_with_genre.csv')

def kmeans_clustering():
    df = pd.read_csv('data_final_old.csv')

    features = [
        'Tempo',
        'Energy',
        'Danceability',
        'Loudness',
        'Liveness',
        'Valence',
        'Acousticness',
        'Speechiness'
    ]

    filtered_df = df[features]
    scaled_df = pd.DataFrame(StandardScaler().fit_transform(filtered_df.values), index = filtered_df.index, columns = filtered_df.columns)
    kmeans = KMeans(n_clusters=3, init='k-means++')
    kmeans.fit(scaled_df)
    labels = kmeans.labels_
    df['Label'] = labels
    df.to_csv('data_final.csv')

def main():
    kmeans_clustering()

    
if __name__ == "__main__":
    main()
    
