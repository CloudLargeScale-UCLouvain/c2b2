echo "Resetting the network"


cd ../blockchain-automation-framework/

#export PATH=~/bin:$PATH
export VAULT_ADDR='http://10.10.2.4:30000'
export VAULT_TOKEN="s.2GHpHvwF2P08YFXfxVaEO7yV"
#export PATH=$PATH:/home/ubuntu/.local/bin



exec ansible-playbook  /home/ubuntu/c2b2/blockchain-automation-framework/platforms/shared/configuration/site.yaml -e "@/home/ubuntu/c2b2/c2b2-controller/ourAutomation/bafNetwork.yaml" -i inventory.ini -e 'ansible_python_interpreter=/usr/bin/python3'   -e "reset='true'"