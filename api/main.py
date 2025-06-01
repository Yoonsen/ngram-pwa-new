from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import dhlab.ngram as ng
import pandas as pd
from datetime import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NgramRequest(BaseModel):
    words: List[str]
    from_year: int
    to_year: int
    doctype: str
    lang: str = 'nob'
    mode: str = 'relative'
    smooth: int = 1

@app.get("/")
async def root():
    return {"message": "N-gram API is running"}

@app.post("/api/ngram")
async def get_ngram_data(request: NgramRequest):
    try:
        # Convert words list to space-separated string
        words_str = ' ,'.join(request.words)
        
        # Determine corpus
        corpus = 'bok' if 'bok' in request.doctype else 'avis'
        
        # Get ngram data
        ngram_data = ng.nb_ngram.nb_ngram(
            words_str,
            corpus=corpus,
            smooth=request.smooth,
            years=(request.from_year, request.to_year),
            mode=request.mode,
            lang=request.lang
        )
        
        # Convert to datetime index
        ngram_data.index = pd.to_datetime(ngram_data.index, format='%Y')
        
        # Process data based on mode
        if request.mode == 'cumulative':
            processed_data = ngram_data.cumsum()
        elif request.mode == 'cohort':
            processed_data = (ngram_data.transpose() / ngram_data.sum(axis=1)).transpose()
        else:
            processed_data = ngram_data
            
        # Convert to format expected by frontend
        result = {
            "dates": processed_data.index.strftime('%Y-%m-%d').tolist(),
            "series": []
        }
        
        for column in processed_data.columns:
            result["series"].append({
                "name": column,
                "data": processed_data[column].tolist()
            })
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 