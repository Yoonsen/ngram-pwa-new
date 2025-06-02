import React from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';

const ConcordanceModal = ({ show, onHide, word, year, corpus }) => {
    const handleSearch = (searchType) => {
        const params = new URLSearchParams({
            q: `"${word}"`,
            mediatype: corpus === 'bok' ? 'bøker' : 'aviser'
        });

        const formatDate = (year) => {
            return `${year}0101`;
        };

        switch (searchType) {
            case 'exact':
                params.append('fromDate', formatDate(year));
                params.append('toDate', formatDate(year + 1));
                break;
            case 'period':
                params.append('fromDate', formatDate(year - 5));
                params.append('toDate', formatDate(year + 6));
                break;
            case 'open':
                // No date parameters for open search
                break;
            default:
                break;
        }

        window.open(`https://www.nb.no/search?${params}`, '_blank');
    };

    const corpusLabel = corpus === 'bok' ? 'bøker' : 'aviser';

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Søk i Nettbiblioteket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Søk etter <strong>{word}</strong> i {corpusLabel}
                </p>
                <ButtonGroup vertical className="d-grid gap-2">
                    <Button variant="primary" onClick={() => handleSearch('exact')}>
                        Søk i året {year}
                    </Button>
                    <Button variant="primary" onClick={() => handleSearch('period')}>
                        Søk i perioden {year - 5} til {year + 5}
                    </Button>
                    <Button variant="primary" onClick={() => handleSearch('open')}>
                        Åpent søk
                    </Button>
                </ButtonGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Lukk
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConcordanceModal; 