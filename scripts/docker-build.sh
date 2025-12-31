#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Default values
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-factoriolab}"
DOCKER_PLATFORMS="${DOCKER_PLATFORMS:-linux/amd64,linux/arm64}"

# Buildx builder name
BUILDER_NAME="factoriolab-builder"

# Usage function
usage() {
    echo "Usage: $0 <version> [options]"
    echo ""
    echo "Arguments:"
    echo "  version              Semantic version (e.g., 1.0.0, v1.0.0)"
    echo ""
    echo "Options:"
    echo "  --push               Push the image to the registry after building"
    echo "  --dry-run            Show what would be done without executing"
    echo "  --platforms <list>   Comma-separated list of platforms (default: linux/amd64,linux/arm64)"
    echo ""
    echo "Environment variables (set in .env file):"
    echo "  DOCKER_REGISTRY      Registry URL (empty for DockerHub)"
    echo "  DOCKER_IMAGE_NAME    Image name (default: factoriolab)"
    echo "  DOCKER_USERNAME      Registry username"
    echo "  DOCKER_PASSWORD      Registry password/token"
    echo "  DOCKER_PLATFORMS     Target platforms (default: linux/amd64,linux/arm64)"
    echo ""
    echo "Examples:"
    echo "  $0 1.0.0                                    # Build for default platforms"
    echo "  $0 1.0.0 --push                             # Build and push"
    echo "  $0 1.0.0 --platforms linux/amd64            # Build for single platform"
    echo "  $0 1.0.0 --platforms linux/amd64,linux/arm64,linux/arm/v7 --push"
    exit 1
}

# Parse semver and return major, minor, patch as space-separated string
parse_semver() {
    local version="$1"
    # Remove 'v' prefix if present
    version="${version#v}"

    if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
        echo ""
        return 1
    fi

    # Extract base version (without prerelease/build metadata)
    local base_version="${version%%-*}"
    base_version="${base_version%%+*}"

    IFS='.' read -r major minor patch <<< "$base_version"
    echo "$major $minor $patch"
}

# Compare two semver versions
# Returns: 1 if v1 > v2, 0 if v1 == v2, -1 if v1 < v2
compare_versions() {
    local v1="$1"
    local v2="$2"

    local parsed1=$(parse_semver "$v1")
    local parsed2=$(parse_semver "$v2")

    if [ -z "$parsed1" ] || [ -z "$parsed2" ]; then
        echo "0"
        return
    fi

    read -r major1 minor1 patch1 <<< "$parsed1"
    read -r major2 minor2 patch2 <<< "$parsed2"

    if [ "$major1" -gt "$major2" ]; then
        echo "1"
    elif [ "$major1" -lt "$major2" ]; then
        echo "-1"
    elif [ "$minor1" -gt "$minor2" ]; then
        echo "1"
    elif [ "$minor1" -lt "$minor2" ]; then
        echo "-1"
    elif [ "$patch1" -gt "$patch2" ]; then
        echo "1"
    elif [ "$patch1" -lt "$patch2" ]; then
        echo "-1"
    else
        echo "0"
    fi
}

# Get the latest git tag (semver only)
get_latest_tag() {
    # Get all tags, filter for semver, sort and get latest
    git tag -l 'v*' 2>/dev/null | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+' | sort -V | tail -n1
}

# Ensure buildx builder exists and is ready
setup_buildx() {
    echo -e "${GREEN}Setting up Docker buildx...${NC}"

    # Check if builder exists
    if ! docker buildx inspect "$BUILDER_NAME" &>/dev/null; then
        echo -e "${YELLOW}Creating buildx builder '$BUILDER_NAME'...${NC}"
        docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap
    fi

    # Use the builder
    docker buildx use "$BUILDER_NAME"

    echo -e "${GREEN}Buildx builder ready${NC}"
}

# Main script
main() {
    local version=""
    local push=false
    local dry_run=false
    local platforms="$DOCKER_PLATFORMS"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --push)
                push=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --platforms)
                if [ -z "$2" ] || [[ "$2" == --* ]]; then
                    echo -e "${RED}Error: --platforms requires a value${NC}"
                    usage
                fi
                platforms="$2"
                shift 2
                ;;
            -h|--help)
                usage
                ;;
            -*)
                echo -e "${RED}Error: Unknown option $1${NC}"
                usage
                ;;
            *)
                if [ -z "$version" ]; then
                    version="$1"
                else
                    echo -e "${RED}Error: Unexpected argument $1${NC}"
                    usage
                fi
                shift
                ;;
        esac
    done

    # Check version argument
    if [ -z "$version" ]; then
        echo -e "${RED}Error: Version argument is required${NC}"
        usage
    fi

    # Normalize version (add 'v' prefix if missing)
    if [[ ! "$version" =~ ^v ]]; then
        version="v$version"
    fi

    # Validate version format
    local parsed=$(parse_semver "$version")
    if [ -z "$parsed" ]; then
        echo -e "${RED}Error: Invalid version format '$version'${NC}"
        echo "Version must be a valid semantic version (e.g., 1.0.0, v1.0.0)"
        exit 1
    fi

    echo -e "${GREEN}Version: $version${NC}"
    echo -e "${GREEN}Platforms: $platforms${NC}"

    # Get latest tag and compare
    local latest_tag=$(get_latest_tag)
    if [ -n "$latest_tag" ]; then
        echo -e "${YELLOW}Latest existing tag: $latest_tag${NC}"

        local comparison=$(compare_versions "$version" "$latest_tag")
        if [ "$comparison" != "1" ]; then
            echo -e "${RED}Error: Version $version is not higher than the latest tag $latest_tag${NC}"
            echo "Please provide a version higher than $latest_tag"
            exit 1
        fi
        echo -e "${GREEN}Version $version is higher than $latest_tag${NC}"
    else
        echo -e "${YELLOW}No existing tags found. This will be the first release.${NC}"
    fi

    # Build full image name
    local image_name
    if [ -n "$DOCKER_REGISTRY" ]; then
        image_name="${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}"
    else
        if [ -n "$DOCKER_USERNAME" ]; then
            image_name="${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}"
        else
            image_name="${DOCKER_IMAGE_NAME}"
        fi
    fi

    local version_tag="${version#v}"  # Remove 'v' prefix for docker tag
    local full_image="${image_name}:${version_tag}"
    local latest_image="${image_name}:latest"

    echo ""
    echo -e "${GREEN}Image: $full_image${NC}"
    echo -e "${GREEN}Also tagged as: $latest_image${NC}"

    if [ "$dry_run" = true ]; then
        echo ""
        echo -e "${YELLOW}=== DRY RUN ===${NC}"
        echo "Would execute:"
        echo "  1. git tag $version"
        echo "  2. docker buildx build --platform $platforms -t $full_image -t $latest_image ."
        if [ "$push" = true ]; then
            echo "     (with --push flag to push to registry)"
            echo "  3. git push origin $version"
        else
            echo "     (with --load flag for local use - only works with single platform)"
        fi
        exit 0
    fi

    # Create git tag
    echo ""
    echo -e "${GREEN}Creating git tag $version...${NC}"
    git tag "$version"

    # Setup buildx
    setup_buildx

    # Build Docker image
    echo ""
    echo -e "${GREEN}Building Docker image for platforms: $platforms${NC}"
    cd "$PROJECT_ROOT"

    if [ "$push" = true ]; then
        # Login if credentials provided
        if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
            echo -e "${GREEN}Logging in to registry...${NC}"
            if [ -n "$DOCKER_REGISTRY" ]; then
                echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
            else
                echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
            fi
        fi

        # Build and push
        docker buildx build \
            --platform "$platforms" \
            -t "$full_image" \
            -t "$latest_image" \
            --push \
            .

        echo ""
        echo -e "${GREEN}Pushing git tag...${NC}"
        git push origin "$version"

        echo ""
        echo -e "${GREEN}Successfully built and pushed:${NC}"
        echo "  - Docker image: $full_image"
        echo "  - Docker image: $latest_image"
        echo "  - Platforms: $platforms"
        echo "  - Git tag: $version"
    else
        # Check if single platform for --load compatibility
        if [[ "$platforms" == *","* ]]; then
            echo -e "${YELLOW}Warning: --load only works with single platform builds.${NC}"
            echo -e "${YELLOW}Building without loading to local docker (use --push to push to registry).${NC}"
            docker buildx build \
                --platform "$platforms" \
                -t "$full_image" \
                -t "$latest_image" \
                .
        else
            # Single platform - can use --load
            docker buildx build \
                --platform "$platforms" \
                -t "$full_image" \
                -t "$latest_image" \
                --load \
                .
        fi

        echo ""
        echo -e "${GREEN}Docker image built successfully!${NC}"
        echo "  - $full_image"
        echo "  - $latest_image"
        echo "  - Platforms: $platforms"

        echo ""
        echo -e "${YELLOW}To push the image and tag, run:${NC}"
        echo "  docker push $full_image"
        echo "  docker push $latest_image"
        echo "  git push origin $version"
    fi
}

main "$@"
