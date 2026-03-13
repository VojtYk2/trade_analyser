import { use, useEffect, useState, useRef } from 'react'
import './App.css'
import cardData from './cards.json';
import searchIcon from './assets/search.png';
import trashIcon from './assets/trash.png';
import cashIcon from './assets/cash.png';

function TradeColumn(props) {
  const removeCard = (index) => {
    props.setTotal((prev) => prev - props.cards[index].price);
    props.setCards(props.cards.filter((_, i) => i !== index));
  };

  return (
    <div className="trade_column">
      <div className='titles'>
        <h2>{props.title}</h2>
        <h3 className={props.total === props.otherTotal ? 'white' : props.total > props.otherTotal ? 'green' : 'red'}>€{props.total}</h3>
      </div>
      { props.cards.length > 0 &&
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
      }
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
    document.activeElement.blur();
    const card = { name: props.card.name, price: props.card.price, link: props.card.link };
    props.setGivingTotal((prev) => prev + card.price);
    props.setGiving([...props.giving, card]);
    props.setIsSearching(false);
  }

  const setReceiving = () => {
    document.activeElement.blur();
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
        const request = await fetch(`/search?text=${text}`);

        const response = await request.json();

        /* const response = cardData */

        setSearchResults(response.data.map((element, index) => {
          return {
            id: index,
            name: element.name,
            setName: element.episode.code,
            number: element.card_number,
            setTotal: element.episode.cards_printed_total,
            img: element.image,
            price: element.prices?.cardmarket?.lowest_near_mint ?? 0,
            link: element.links.cardmarket
          };
        }));

        document.activeElement.blur();
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
    <div className="search-window">
      <div className='searchBarContainer'>
        <label className="search-bar" onClick={() => props.setIsSearching(true)}>
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input type="text" onChange={search} placeholder="Search cards..." />
        </label>
      </div>
      <div className='search-results'>
        {searchResults.map((element, index) => {
          return (
            <div key={index} className={`card card-${element.id}`} onClick={() => showButtons(element.id)} >
              <img src={element.img} alt={element.name} />
              <div className='card-content'>
                <h3>{element.name}</h3>
                <p>{element.setName} - {element.number}/{element.setTotal}</p>
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

function App() {
  const [givingTotal, setGivingTotal] = useState(0)
  const [receivingTotal, setReceivingTotal] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [searching, setSearching] = useState('');
  const [giving, setGiving] = useState([]);
  const [receiving, setReceiving] = useState([]);

  return (
    <div className="App">
      <h1>Trade Analyser</h1>
      <div className='body'>
        <div className='addButtons'>
          <button onClick={() => {
            setSearching('giving');
            setIsSearching(true);
            }}>
            Give
          </button>
          <button onClick={() => {
            setSearching('receiving');
            setIsSearching(true);
            }}>
            Receive
          </button>
        </div>
        <div className="totals">
          <TradeColumn
            title="I'm Giving"

            total={givingTotal}
            setTotal={setGivingTotal}
            otherTotal={receivingTotal}

            cards={giving}
            setCards={setGiving}

            setIsSearching={setIsSearching}
          />
          <TradeColumn
            title="I'm Receiving"

            total={receivingTotal}
            setTotal={setReceivingTotal}
            otherTotal={givingTotal}

            cards={receiving}
            setCards={setReceiving}

            setIsSearching={setIsSearching}
          />
        </div>
        { isSearching &&
        <div className='search-window-blur'>
          <div className='exit' onClick={() => {
            document.activeElement.blur();
            setIsSearching(false);
          }}>
          </div>
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
        }
      </div>
    </div>
  )
}

export default App
