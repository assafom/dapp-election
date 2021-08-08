pragma solidity 0.5.0;

contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    mapping(uint => Candidate) public candidates;
    
    mapping(address => bool) public hasVoted;


    uint public candidatesCount;

    constructor() public {
        candidatesCount = 0;
        addCandidate("Candi 1");
        addCandidate("Candi 2");
    }

    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender]);
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount ++;
        emit votedEvent(_candidateId);
    }

    function addCandidate (string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }    
}