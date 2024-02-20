import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Dropdown.css';

const Dropdown = ({ selectOption, options, onSelect, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(selectOption.toString() || '');
    const [selectedOption, setSelectedOption] = useState(selectOption.toString() || '');
    const [filteredOptions, setFilteredOptions] = useState([]);

    useEffect(() => {
        const filtered = options.filter((option) =>
            option.toString().toLowerCase().includes(searchTerm.toString().toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [options, searchTerm]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleOptionSelect = (option) => {
        console.log(selectOption)
        const optionValue = option.toString();
        setSelectedOption(optionValue);
        setSearchTerm(optionValue);
        onSelect(optionValue);
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setSearchTerm('');
    };
    return (
        <div className="dropdown">
            <div className="dropdown__field">
                <input
                    id={id}
                    type="text"
                    className="dropdown__input"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Поиск"
                    onFocus={handleInputFocus}
                />
                <button className="dropdown__button" onClick={toggleDropdown}>
                    <span className="visually-hidden">Открыть выпадающий список</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="img" fill="currentColor" height="24" width="24" aria-hidden="false" aria-label="Chevron Down">
                        <path d="M8 14.02a2 2 0 0 1 3.411-1.411l6.578 6.572 6.578-6.572a2 2 0 0 1 2.874 2.773l-.049.049-7.992 7.984a2 2 0 0 1-2.825 0l-7.989-7.983A1.989 1.989 0 0 1 8 14.02Z"></path>
                    </svg>
                </button>
                <ul className="dropdown__list" style={{ display: isOpen ? 'block' : 'none' }}>
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            className="dropdown__item"
                        >
                            <button
                                className="dropdown__option"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option.toString()}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

Dropdown.propTypes = {
    selectOption: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
    id: PropTypes.string,
};


export default Dropdown;
