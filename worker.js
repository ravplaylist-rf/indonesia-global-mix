const TMDB_BASE = 'https://api.themoviedb.org/3';
const catalogs = [
  {type:'movie', id:'id_movies_trending', name:'🇮🇩 Film Indonesia Trending', mode:'discover_movie_id'},
  {type:'movie', id:'id_movies_new', name:'🇮🇩 Film Indonesia Terbaru', mode:'discover_movie_new_id'},
  {type:'movie', id:'id_movies_top', name:'🇮🇩 Film Indonesia Rating Tertinggi', mode:'discover_movie_top_id'},
  {type:'series', id:'id_series_trending', name:'🇮🇩 Series Indonesia Trending', mode:'discover_tv_id'},
  {type:'movie', id:'world_movies_trending', name:'🌍 Film Global Trending', mode:'trending_movie'},
  {type:'series', id:'world_series_trending', name:'🌍 Series Global Trending', mode:'trending_tv'},
  {type:'movie', id:'world_movies_top', name:'⭐ Film Global Rating Tertinggi', mode:'top_movie'},
  {type:'series', id:'world_series_top', name:'⭐ Series Global Rating Tertinggi', mode:'top_tv'}
];
function manifest(host) {
  return { id:'org.rav.indonesia-global-catalog', name:'Indonesia + Global Mix', description:'Katalog film dan series Indonesia serta trending global. Metadata katalog saja; tidak menyediakan stream.', version:'1.0.0', logo:'https://www.themoviedb.org/assets/2/v4/logos/long-logo.svg', resources:['catalog'], types:['movie','series'], idPrefixes:['tmdb:'], catalogs: catalogs.map(({type,id,name})=>({type,id,name})), behaviorHints:{adult:false} };
}
async function tmdb(path, key) {
  const r = await fetch(`${TMDB_BASE}${path}`, {headers:{Authorization:`Bearer ${key}`, accept:'application/json'}});
  if (!r.ok) throw new Error(`TMDB API error ${r.status}`);
  return r.json();
}
function poster(path){ return path ? `https://image.tmdb.org/t/p/w500${path}` : undefined; }
function toPreview(item, type){
  const id = `tmdb:${item.id}`;
  const title = type==='movie' ? item.title : item.name;
  const year = (type==='movie' ? item.release_date : item.first_air_date)?.slice(0,4);
  const obj = {id,type,name:title,poster:poster(item.poster_path),description:item.overview || '', ...(year?{releaseInfo:year}:{})};
  if (item.vote_average) obj.imdbRating = String(Math.round(item.vote_average*10)/10);
  return obj;
}
async function getCatalog(id, type, key){
  const c = catalogs.find(x=>x.id===id && x.type===type); if(!c) return {metas:[]};
  let path;
  switch(c.mode){
    case 'discover_movie_id': path='/discover/movie?with_origin_country=ID&sort_by=popularity.desc&vote_count.gte=5'; break;
    case 'discover_movie_new_id': path='/discover/movie?with_origin_country=ID&sort_by=primary_release_date.desc&vote_count.gte=3&primary_release_date.lte='+new Date().toISOString().slice(0,10); break;
    case 'discover_movie_top_id': path='/discover/movie?with_origin_country=ID&sort_by=vote_average.desc&vote_count.gte=30'; break;
    case 'discover_tv_id': path='/discover/tv?with_origin_country=ID&sort_by=popularity.desc&vote_count.gte=3'; break;
    case 'trending_movie': path='/trending/movie/week'; break;
    case 'trending_tv': path='/trending/tv/week'; break;
    case 'top_movie': path='/movie/top_rated'; break;
    case 'top_tv': path='/tv/top_rated'; break;
  }
  const data=await tmdb(path+'&language=id-ID&page=1',key);
  return {metas:(data.results||[]).map(x=>toPreview(x,type)).filter(x=>x.name && x.poster)};
}
export default {
 async fetch(request, env){
   const url=new URL(request.url); const key=env.TMDB_READ_TOKEN;
   if(url.pathname==='/manifest.json') return Response.json(manifest(url.host),{headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600'}});
   const match=url.pathname.match(/^\/catalog\/(movie|series)\/([^/]+)\.json$/);
   if(match){ if(!key) return Response.json({error:'TMDB_READ_TOKEN secret belum diset'},{status:500});
     try {const res=await getCatalog(match[2],match[1],key); return Response.json(res,{headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=1800'}});}
     catch(e){return Response.json({metas:[],error:String(e)},{status:502,headers:{'Access-Control-Allow-Origin':'*'}})}
   }
   return new Response('Indonesia + Global Mix catalog addon. See /manifest.json',{headers:{'Access-Control-Allow-Origin':'*'}});
 }
};
