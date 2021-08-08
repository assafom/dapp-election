App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.ethereum;
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      /*try {
        // Will open the MetaMask UI
        // You should disable this button while the request is pending!
        await ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error(error);
      }*/
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        //App.render();
      });
    });
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  castVote: async function() {
    var candidateId = $('#candidatesSelect').val();
    var instance = await App.contracts.Election.deployed();
    var voteResult = await instance.vote(candidateId, { from: App.account });
    // Wait for votes to update
    /*$("#content").hide();
    $("#loader").show();*/
    App.render();
  },

  render: async function() {
    console.log("render..");
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    var instance = await App.contracts.Election.deployed();
    var electionInstance = instance;
    var candidatesCount = await electionInstance.candidatesCount();

    var candidatesResults = $("#candidatesResults");
    candidatesResults.empty();

    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();

    for (var i = 1; i <= candidatesCount; i++) {
      var candidate = await electionInstance.candidates(i);
      var id = candidate[0];
      var name = candidate[1];
      var voteCount = candidate[2];
      var donationAddr = candidate[3];
      var donationAmount = 0;
      (async function getBalance(i) {
        await web3.eth.getBalance(donationAddr, function(err, response) {
          console.log(err);
          console.log(response);
          if (err === null) {
            console.log(response.toString());
            var divId = "#donationAmount" + i;
            console.log(divId);
            $(divId).html(response.toNumber() / 1000000000000000000);
          }
        });
      })(i);

      // Render candidate Result
      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td><td>" + "<div id=donationAmount" + i + ">0</div>" + "</td><td>" + donationAddr + "</td></tr>"
      candidatesResults.append(candidateTemplate);

      // Render candidate ballot option
      var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
      candidatesSelect.append(candidateOption);
    }
    var hasVoted = await electionInstance.hasVoted(App.account);
    // Do not allow a user to vote
    if(hasVoted) {
      $('form').hide();
      $('#alreadyVoted').show();
    } else {
      $('form').show();
      $('#alreadyVoted').hide();
    }
    loader.hide();
    content.show();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
