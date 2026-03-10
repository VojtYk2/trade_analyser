import { use, useEffect, useState, useRef } from 'react'
import './App.css'
import cardData from './cards.json';
import searchIcon from './assets/search.png';
import trashIcon from './assets/trash.png';

function TradeColumn(props) {
  return (
    <div className="trade_column">
      <div className='titles'>
        <h2>{props.title}</h2>
        <p><b>€{props.value}</b></p>
      </div>
      <div className='cardListContainer'>
        { props.cards.map((card, index) => {
          return (
            <div key={index} className='cardListDiv'>
              <a key={index} className="cardList" href={card.link} target="_blank" rel="noreferer">
                <p>{card.name}</p>
                <p>€{card.price}</p>
              </a>
              <button className='removeButton'><img src={trashIcon} alt="Remove" /></button>
            </div>
          );
        })}
      </div>
    </div>
  )
}

function Buttons(props) {
  const setGiving = async () => {
    const card = { name: props.card.name, price: props.card.price, link: props.card.link };
    props.setGivingTotal((prev) => prev + card.price);
    props.setGiving([...props.giving, card]);
    props.setIsSearching(false);
  }

  const setReceiving = async () => {
    const card = { name: props.card.name, price: props.card.price, link: props.card.link };
    props.setReceivingTotal((prev) => prev + card.price);
    props.setReceiving([...props.receiving, card]);
    props.setIsSearching(false);
  }

  return (
    <div className="buttons">
      <button onClick={setGiving}>Give</button>
      <button onClick={setReceiving}>Receive</button>
    </div>
  )
}

function SearchBar(props) {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const timer = useRef(null);

  const search = async (e) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {

      const text = e.target.value;
      if(text.length > 3) {
        const request = await fetch(`https://cardmarket-api-tcg.p.rapidapi.com/pokemon/cards/search?search=${text}&rapidapi-key=${import.meta.env.VITE_RAPIDAPI_KEY}&sort=relevance`);
        const response = await request.json();

        /* const response = cardData */

        setSearchResults(response.data.map((element, index) => {
          return {
            id: index,
            name: element.name,
            setName: element.episode.name,
            number: element.card_number,
            img: element.image,
            price: element.prices?.cardmarket?.lowest_near_mint ?? 0,
            link: element.links.cardmarket
          };
        }));
      }
      else {
        setSearchResults([]);
      }
    }, 500);
  };

  const showButtons = (id) => {
    setSelectedCard(id);
  };

  return (
    <div className="search-container">
      <label className="search-bar" onClick={() => props.setIsSearching(true)}>
        <img src={searchIcon} alt="Search" className="search-icon" />
        <input type="text" autoFocus={props.isSearching} onChange={search} placeholder="Search cards..." />
      </label>
      { props.search &&
      <div className='search-results'>
        {searchResults.map((element, index) => {
          return (
            <div key={index} className={`card card-${element.id}`} onClick={() => showButtons(element.id)}>
              <img src={element.img} alt={element.name} />
              <h3>{element.name}</h3>
              <p>{element.setName}</p>
              <p>{element.number}</p>
              { selectedCard === element.id &&
                <Buttons
                  givingTotal={props.givingTotal}
                  setGivingTotal={props.setGivingTotal}
                  receivingTotal={props.receivingTotal}
                  setReceivingTotal={props.setReceivingTotal}
                  setIsSearching={props.setIsSearching}
                  giving={props.giving}
                  setGiving={props.setGiving}
                  receiving={props.receiving}
                  setReceiving={props.setReceiving}
                  card={element}
                />
              }
            </div>
          );
        })}
      </div>
      }
    </div>
  )
}

function App() {
  const [givingTotal, setGivingTotal] = useState(0)
  const [receivingTotal, setReceivingTotal] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [giving, setGiving] = useState([{name: 'Charizard', price: 100, link: 'https://www.cardmarket.com/en/Pokemon/Products/Singles/SwSh-Chilling-Reign/Charizard-SSR'}]);
  const [receiving, setReceiving] = useState([]);

  return (
    <div className="App">
      <h1>Trade Analyser</h1>
      <div className="search">
        <SearchBar setIsSearching={setIsSearching} isSearching={isSearching} search={false} />
      </div>
      <div className="totals">
        <TradeColumn title="I'm Giving" value={givingTotal} cards={giving} />
        <TradeColumn title="I'm Receiving" value={receivingTotal} cards={receiving} />
      </div>
      { isSearching &&
      <div className='search-window-blur'>
        <div className='exit' onClick={() => setIsSearching(false)}></div>
        <div className='search-window'>
          <SearchBar
            setIsSearching={setIsSearching}
            isSearching={isSearching}
            search={true}
            givingTotal={givingTotal}
            setGivingTotal={setGivingTotal}
            receivingTotal={receivingTotal}
            setReceivingTotal={setReceivingTotal}
            giving={giving}
            setGiving={setGiving}
            receiving={receiving}
            setReceiving={setReceiving}
          />
        </div>
      </div>
      }
    </div>
  )
}

export default App
