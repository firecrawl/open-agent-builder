#!/bin/bash

# Ollama Model Management Script
# Usage: ./scripts/manage-ollama.sh [command]

set -e

OLLAMA_CONTAINER="open-agent-builder-ollama"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${OLLAMA_CONTAINER}$"; then
        print_error "Ollama container is not running. Start it with: docker-compose up ollama"
        exit 1
    fi
}

list_models() {
    print_header "Installed Ollama Models"
    docker exec $OLLAMA_CONTAINER ollama list
    echo ""
    print_info "To pull more models, run: $0 pull <model-name>"
}

pull_model() {
    if [ -z "$1" ]; then
        print_error "Please specify a model name"
        echo "Examples:"
        echo "  $0 pull llama3.1:8b"
        echo "  $0 pull mistral:7b"
        echo "  $0 pull codellama:7b"
        exit 1
    fi
    
    print_header "Pulling Model: $1"
    docker exec $OLLAMA_CONTAINER ollama pull "$1"
    print_success "Model $1 pulled successfully"
}

remove_model() {
    if [ -z "$1" ]; then
        print_error "Please specify a model name"
        echo "Example: $0 remove llama3.1:8b"
        exit 1
    fi
    
    print_header "Removing Model: $1"
    docker exec $OLLAMA_CONTAINER ollama rm "$1"
    print_success "Model $1 removed successfully"
}

test_model() {
    if [ -z "$1" ]; then
        print_error "Please specify a model name"
        echo "Example: $0 test llama3.2:3b"
        exit 1
    fi
    
    print_header "Testing Model: $1"
    print_info "Sending test prompt..."
    docker exec $OLLAMA_CONTAINER ollama run "$1" "Say hello in one sentence"
}

check_status() {
    print_header "Ollama Status"
    
    if docker ps --format '{{.Names}}' | grep -q "^${OLLAMA_CONTAINER}$"; then
        print_success "Ollama is running"
        
        # Check health
        if curl -sf http://localhost:11434/ > /dev/null 2>&1; then
            print_success "Ollama API is responding"
        else
            print_error "Ollama API is not responding"
        fi
        
        echo ""
        list_models
    else
        print_error "Ollama is not running"
        print_info "Start with: docker-compose up ollama"
    fi
}

show_popular() {
    print_header "Popular Models to Try"
    echo ""
    echo "Small Models (Fast, Low RAM):"
    echo "  • llama3.2:3b          - General purpose (already installed)"
    echo "  • qwen2.5-coder:7b     - Coding specialist (already installed)"
    echo "  • phi3:mini            - Microsoft's efficient model"
    echo ""
    echo "Medium Models (Balanced):"
    echo "  • llama3.1:8b          - Improved general purpose"
    echo "  • mistral:7b           - Fast and capable"
    echo "  • codellama:7b         - Code generation"
    echo ""
    echo "Large Models (Best Quality, High RAM):"
    echo "  • llama3.1:70b         - Highest quality (requires 64GB+ RAM)"
    echo "  • mixtral:8x7b         - Mixture of experts"
    echo ""
    echo "To install: $0 pull <model-name>"
}

show_usage() {
    echo "Ollama Model Management"
    echo ""
    echo "Usage: $0 [command] [args]"
    echo ""
    echo "Commands:"
    echo "  list              List installed models"
    echo "  pull <model>      Pull a new model"
    echo "  remove <model>    Remove a model"
    echo "  test <model>      Test a model with a prompt"
    echo "  status            Check Ollama status"
    echo "  popular           Show popular models"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 pull llama3.1:8b"
    echo "  $0 test llama3.2:3b"
    echo "  $0 remove mistral:7b"
}

# Main command router
case "${1:-help}" in
    list)
        check_container
        list_models
        ;;
    pull)
        check_container
        pull_model "$2"
        ;;
    remove|rm)
        check_container
        remove_model "$2"
        ;;
    test)
        check_container
        test_model "$2"
        ;;
    status)
        check_status
        ;;
    popular)
        show_popular
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

