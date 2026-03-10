import { use, useEffect, useState, useRef } from 'react'
import './App.css'
import cardData from './cards.json';
import searchIcon from './assets/search.png';
import trashIcon from './assets/trash.png';
import addIcon from './assets/add.png';

function TradeColumn(props) {
  const removeCard = (index) => {
    props.setTotal((prev) => prev - props.cards[index].price);
    props.setCards(props.cards.filter((_, i) => i !== index));
  };

  return (
    <div className="trade_column">
      <div className='heading'>
        <div className='titles'>
          <h2>{props.title}</h2>
          <h3>€{props.total}</h3>
        </div>
        <button onClick={() => {
          props.setSearching(props.searching);
          props.setIsSearching(true)
          }}>
            <img src={addIcon} alt="+" />
        </button>
      </div>
      <div className='cardListContainer'>
        { props.cards.map((card, index) => {
          return (
            <div key={index} className='cardListDiv'>
              <a key={index} className="cardList" href={card.link} target="_blank" rel="noreferer">
                <p>{card.name}</p>
                <p>€{card.price}</p>
              </a>
              <button className='removeButton' onClick={() => removeCard(index)} ><img src={trashIcon} alt="Remove" /></button>
            </div>
          );
        })}
      </div>
    </div>
  )
}

function Buttons(props) {
  const addCard = () => {
    if(props.searching === 'giving') {
      setGiving();
    }
    else if(props.searching === 'receiving') {
      setReceiving();
    }
  }

  const setGiving = () => {
    const card = { name: props.card.name, price: props.card.price, link: props.card.link };
    props.setGivingTotal((prev) => prev + card.price);
    props.setGiving([...props.giving, card]);
    props.setIsSearching(false);
  }

  const setReceiving = () => {
    const card = { name: props.card.name, price: props.card.price, link: props.card.link };
    props.setReceivingTotal((prev) => prev + card.price);
    props.setReceiving([...props.receiving, card]);
    props.setIsSearching(false);
  }

  return (
    <div className="buttons">
      <button onClick={addCard}>Add</button>
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
        <input type="text" onChange={search} placeholder="Search cards..." />
      </label>
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
                  searching={props.searching}
                  setIsSearching={props.setIsSearching}

                  giving={props.giving}
                  setGiving={props.setGiving}
                  givingTotal={props.givingTotal}
                  setGivingTotal={props.setGivingTotal}

                  receiving={props.receiving}
                  setReceiving={props.setReceiving}
                  receivingTotal={props.receivingTotal}
                  setReceivingTotal={props.setReceivingTotal}

                  card={element}
                />
              }
            </div>
          );
        })}
      </div>
    </div>
  )
}

function App() {
  const [givingTotal, setGivingTotal] = useState(100)
  const [receivingTotal, setReceivingTotal] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [searching, setSearching] = useState('');
  const [giving, setGiving] = useState([{name: 'Charizard', price: 100, link: 'https://www.cardmarket.com/en/Pokemon/Products/Singles/SwSh-Chilling-Reign/Charizard-SSR'}]);
  const [receiving, setReceiving] = useState([]);

  return (
    <div className="App">
      <h1>Trade Analyser</h1>
      <div className="totals">
        <TradeColumn title="I'm Giving" total={givingTotal} setTotal={setGivingTotal} cards={giving} setCards={setGiving} setIsSearching={setIsSearching} setSearching={setSearching} searching={'giving'} />
        <TradeColumn title="I'm Receiving" total={receivingTotal} setTotal={setReceivingTotal} cards={receiving} setCards={setReceiving} setIsSearching={setIsSearching} setSearching={setSearching} searching={'receiving'} />
      </div>
      { isSearching &&
      <div className='search-window-blur'>
        <div className='exit' onClick={() => setIsSearching(false)}></div>
        <div className='search-window'>
          <SearchBar
            searching={searching}
            isSearching={isSearching}
            setIsSearching={setIsSearching}

            giving={giving}
            setGiving={setGiving}
            givingTotal={givingTotal}
            setGivingTotal={setGivingTotal}

            receiving={receiving}
            setReceiving={setReceiving}
            receivingTotal={receivingTotal}
            setReceivingTotal={setReceivingTotal}
          />
        </div>
      </div>
      }
    </div>
  )
}

export default App
